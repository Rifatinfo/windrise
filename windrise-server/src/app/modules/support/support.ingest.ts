/**
 * Everything that puts a *customer's* words into the inbox.
 *
 * Two sources today — a Messenger webhook and a Windee handoff — and both end
 * at the same place: a `SupportConversation` sitting in a queue with a
 * transcript an agent can read. Agent-side actions live in the service; this
 * file only ever writes on the customer's behalf.
 */

import {
  ChatRole,
  Prisma,
  SupportChannel,
  SupportConversationStatus,
  SupportEventType,
  SupportMessageAuthor,
} from "@prisma/client";

import prisma from "../../../shared/prisma";
import {
  broadcastConversation,
  broadcastMessage,
  generalQueueId,
  messageInclude,
  nextTicketNo,
  preview,
  recordEvent,
  shapeMessage,
  upsertContact,
} from "./support.core";
import type { InboundMessage } from "./support.messenger";
import { fetchProfile } from "./support.messenger";

/**
 * The conversation a new customer message belongs to.
 *
 * An open thread is continued; anything else starts a fresh ticket. Reopening a
 * closed conversation would quietly reset a resolved-today count and hide the
 * new question at the bottom of an old transcript, so a closed thread stays
 * closed and the customer's next message gets its own reference.
 */
const openConversationFor = async (contactId: string, channel: SupportChannel) =>
  prisma.supportConversation.findFirst({
    where: { contactId, channel, status: { not: SupportConversationStatus.CLOSED } },
    orderBy: { lastMessageAt: "desc" },
  });

type CreateConversationInput = {
  channel: SupportChannel;
  contactId: string;
  externalId?: string | null;
  chatSessionId?: string | null;
  subject?: string | null;
};

const createConversation = async (input: CreateConversationInput) => {
  const conversation = await prisma.supportConversation.create({
    data: {
      ticketNo: await nextTicketNo(),
      channel: input.channel,
      contactId: input.contactId,
      externalId: input.externalId ?? null,
      chatSessionId: input.chatSessionId ?? null,
      subject: input.subject ?? null,
      queueId: await generalQueueId(),
      status: SupportConversationStatus.IN_QUEUE,
    },
  });

  await recordEvent(conversation.id, SupportEventType.CREATED);
  return conversation;
};

type AppendInput = {
  conversationId: string;
  author: SupportMessageAuthor;
  body: string;
  attachments?: Prisma.InputJsonValue;
  externalId?: string | null;
  createdAt?: Date;
  /** Bot replay lines should not light up the unread badge. */
  countsAsUnread?: boolean;
};

/**
 * Writes one customer/bot line and keeps the conversation's denormalised
 * summary in step, in a single transaction so the list can never show a preview
 * for a message that failed to save.
 */
const appendInbound = async (input: AppendInput) => {
  const [message] = await prisma.$transaction([
    prisma.supportMessage.create({
      data: {
        conversationId: input.conversationId,
        author: input.author,
        body: input.body,
        attachments: input.attachments,
        externalId: input.externalId ?? null,
        createdAt: input.createdAt ?? new Date(),
      },
      include: messageInclude,
    }),
    prisma.supportConversation.update({
      where: { id: input.conversationId },
      data: {
        lastMessageAt: input.createdAt ?? new Date(),
        lastMessagePreview: preview(input.body, input.attachments ? 1 : 0),
        ...(input.countsAsUnread === false ? {} : { unreadForAgent: { increment: 1 } }),
      },
    }),
  ]);

  return message;
};

// ---------------------------------------------------------------------------
// Messenger
// ---------------------------------------------------------------------------

/**
 * Files one Messenger message.
 *
 * Meta retries any delivery it did not get a 200 for, so the same `mid` can
 * arrive several times. The unique index on `externalId` is what makes that
 * harmless — a duplicate is detected and dropped rather than appearing twice in
 * the agent's transcript.
 */
export const ingestMessengerMessage = async (inbound: InboundMessage) => {
  const duplicate = await prisma.supportMessage.findUnique({
    where: { externalId: inbound.externalId },
    select: { id: true },
  });
  if (duplicate) return null;

  const known = await prisma.supportContact.findUnique({
    where: {
      channel_externalId: { channel: SupportChannel.MESSENGER, externalId: inbound.senderId },
    },
    select: { id: true, name: true },
  });

  // Only pay for the profile lookup the first time we meet someone.
  const profile = known?.name ? {} : await fetchProfile(inbound.senderId);

  const contact = await upsertContact({
    channel: SupportChannel.MESSENGER,
    externalId: inbound.senderId,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    locale: profile.locale,
  });

  const existing = await openConversationFor(contact.id, SupportChannel.MESSENGER);
  const isNew = !existing;

  const conversation =
    existing ??
    (await createConversation({
      channel: SupportChannel.MESSENGER,
      contactId: contact.id,
      externalId: inbound.senderId,
    }));

  const message = await appendInbound({
    conversationId: conversation.id,
    author: SupportMessageAuthor.CUSTOMER,
    body: inbound.text,
    attachments: inbound.attachments.length
      ? (inbound.attachments as unknown as Prisma.InputJsonValue)
      : undefined,
    externalId: inbound.externalId,
    createdAt: inbound.sentAt,
  });

  broadcastMessage({ id: conversation.id, chatSessionId: null }, shapeMessage(message));
  await broadcastConversation(conversation.id, isNew ? "conversation.created" : "conversation.updated");

  return { conversationId: conversation.id, messageId: message.id };
};

// ---------------------------------------------------------------------------
// Windee
// ---------------------------------------------------------------------------

/** What of the bot transcript is worth replaying for the agent. */
const REPLAYABLE: ChatRole[] = [ChatRole.USER, ChatRole.ASSISTANT];

/**
 * The support message that stands for one Windee chat line.
 *
 * `externalId` is unique, so stamping the chat message's id on the mirrored
 * copy makes every path into the transcript idempotent — the live mirror and
 * the handoff replay can both run over the same line and it still appears
 * once. It is the same mechanism that keeps Meta's webhook retries from
 * double-posting.
 */
const windeeRef = (chatMessageId: string) => `windee:${chatMessageId}`;

const attachmentsOf = (imageUrl?: string | null) =>
  imageUrl
    ? ([{ url: imageUrl, mime: "image/*", name: "attachment" }] as unknown as Prisma.InputJsonValue)
    : undefined;

type MirrorableLine = {
  id: string;
  role: ChatRole;
  content: string;
  imageUrl?: string | null;
  createdAt?: Date;
};

/**
 * Copies bot transcript lines into the ticket.
 *
 * Used when a ticket first opens, to carry across everything said before it
 * existed. From then on lines arrive through `mirrorWindeeMessage` as they are
 * written, and the `externalId` stamp means running this again — on a reopen,
 * say — cannot duplicate what is already there.
 *
 * Replayed lines are history, not new work, so they never raise the unread
 * badge; that badge should mean "something arrived since you looked".
 */
const replayBotTranscript = async (
  conversationId: string,
  messages: MirrorableLine[],
  since?: Date | null,
) => {
  const lines = messages.filter(
    (m) =>
      REPLAYABLE.includes(m.role) &&
      m.content.trim() &&
      (!since || !m.createdAt || m.createdAt > since),
  );

  const written = [];

  for (const line of lines) {
    const message = await appendInbound({
      conversationId,
      author:
        line.role === ChatRole.USER ? SupportMessageAuthor.CUSTOMER : SupportMessageAuthor.BOT,
      body: line.content,
      attachments: attachmentsOf(line.imageUrl),
      externalId: windeeRef(line.id),
      createdAt: line.createdAt,
      countsAsUnread: false,
    }).catch(() => null);

    if (message) written.push(message);
  }

  return written;
};

/**
 * The customer asking for a person again on a ticket they had ended.
 *
 * `chatSessionId` is unique on the conversation, so a returning visitor cannot
 * be given a second ticket for the same Windee session — the thread they closed
 * is the thread they come back to. It is reopened loudly rather than quietly:
 * the agent gets a line saying they are back, whatever passed with Windee in
 * between is replayed so the request is not missing its context, the unread
 * badge is raised, and the inbox is told about it as new work so it surfaces in
 * the list and on the notification bell.
 *
 * Where it lands follows the same rule as an agent pressing Reopen: back to
 * whoever had it, or into the queue if nobody did.
 */
const reopenForVisitor = async (
  conversation: { id: string; assignedAgentId: string | null; closedAt: Date | null; chatSessionId: string | null },
  session: { messages: MirrorableLine[] },
) => {
  await replayBotTranscript(conversation.id, session.messages, conversation.closedAt);

  const line = await prisma.supportMessage.create({
    data: {
      conversationId: conversation.id,
      author: SupportMessageAuthor.SYSTEM,
      body: "The customer came back and asked to speak to a person again.",
    },
    include: messageInclude,
  });

  const reopened = await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: {
      status: conversation.assignedAgentId
        ? SupportConversationStatus.WITH_AGENT
        : SupportConversationStatus.IN_QUEUE,
      closedAt: null,
      closedById: null,
      // Whatever the replayed history says, the customer is waiting on a
      // person from this moment.
      unreadForAgent: 1,
      lastMessageAt: new Date(),
      lastMessagePreview: "Asked to speak to a person again",
    },
  });

  await recordEvent(conversation.id, SupportEventType.REOPENED, null, { by: "customer" });
  if (!conversation.assignedAgentId) {
    await recordEvent(conversation.id, SupportEventType.QUEUED, null, { source: "windee-handoff" });
  }

  broadcastMessage(conversation, shapeMessage(line));
  // Announced as created, not updated: it is work arriving, and the inbox
  // brings a created conversation to the top of the list.
  await broadcastConversation(conversation.id, "conversation.created");

  return reopened;
};

/**
 * Promotes a Windee chat to a support ticket.
 *
 * Called when a visitor asks for a person. The bot transcript is copied across
 * so the agent opens the thread already knowing what was asked and what Windee
 * answered — being made to repeat yourself to a second responder is the whole
 * reason handoffs feel bad.
 *
 * Idempotent while the ticket is open: a double tap on "Talk to a human"
 * returns the ticket that already exists rather than creating a second one.
 *
 * A *closed* ticket is a different matter. The customer pressed End chat and
 * has now come back, which is new work — returning the closed row untouched, as
 * this used to, left the inbox with no notification, no unread badge and a
 * conversation still refusing replies, while the widget sat in a queue nobody
 * had been told about.
 */
export const handoffWindeeSession = async (chatSessionId: string) => {
  const existing = await prisma.supportConversation.findUnique({
    where: { chatSessionId },
  });
  if (existing && existing.status !== SupportConversationStatus.CLOSED) return existing;

  const session = await prisma.chatSession.findUnique({
    where: { id: chatSessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return existing ?? null;

  if (existing) return reopenForVisitor(existing, session);

  const contact = await upsertContact({
    channel: SupportChannel.WINDEE,
    externalId: session.visitorId,
    name: session.name,
    phone: session.phone,
    userId: session.userId,
  });

  const conversation = await createConversation({
    channel: SupportChannel.WINDEE,
    contactId: contact.id,
    chatSessionId: session.id,
  });

  await replayBotTranscript(conversation.id, session.messages);

  const lastAsked = session.messages
    .filter((m) => m.role === ChatRole.USER && m.content.trim())
    .at(-1)?.content;

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: {
      // The customer is waiting on a person from this moment, whatever the
      // replayed history says.
      unreadForAgent: 1,
      lastMessageAt: new Date(),
      lastMessagePreview: lastAsked?.slice(0, 140) ?? "Asked to speak to a person",
    },
  });

  await recordEvent(conversation.id, SupportEventType.QUEUED, null, { source: "windee-handoff" });
  await broadcastConversation(conversation.id, "conversation.created");

  return conversation;
};

/**
 * The customer pressing "End chat" in the widget.
 *
 * Closes the ticket from their side and leaves a line saying so, so an agent
 * mid-reply learns why the person stopped answering rather than being left
 * typing into a conversation nobody is reading. Returns them to Windee.
 */
export const endSupportForVisitor = async (chatSessionId: string) => {
  const conversation = await prisma.supportConversation.findUnique({
    where: { chatSessionId },
    select: { id: true, status: true, chatSessionId: true },
  });

  if (!conversation || conversation.status === SupportConversationStatus.CLOSED) return null;

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: {
      status: SupportConversationStatus.CLOSED,
      closedAt: new Date(),
      unreadForAgent: 0,
    },
  });

  const line = await prisma.supportMessage.create({
    data: {
      conversationId: conversation.id,
      author: SupportMessageAuthor.SYSTEM,
      body: "The customer ended the chat and went back to Windee.",
    },
    include: messageInclude,
  });

  await recordEvent(conversation.id, SupportEventType.CLOSED, null, { by: "customer" });
  broadcastMessage(conversation, shapeMessage(line));
  await broadcastConversation(conversation.id, "conversation.closed");

  return conversation;
};

/**
 * Mirrors one Windee chat line into the support transcript.
 *
 * Called for everything the customer types and everything Windee answers, for
 * as long as a ticket exists for the session — whether it is open with an
 * agent or closed and back with the bot. The inbox is meant to be the whole
 * story of a conversation, not just the stretch a human was on: an agent
 * picking a returning customer back up needs to see what the bot told them in
 * between, and previously that stretch was thrown away.
 *
 * What it deliberately does not do is treat bot chatter as work. A closed
 * ticket stays closed and unread stays where it is — only a message typed to a
 * *person* means somebody is waiting. Reopening is still the customer's
 * decision, made by asking for a human.
 */
export const mirrorWindeeMessage = async (
  chatSessionId: string,
  line: MirrorableLine,
) => {
  // TOOL rows are machine plumbing and empty assistant turns carry nothing.
  if (!REPLAYABLE.includes(line.role) || !line.content.trim()) return null;

  const conversation = await prisma.supportConversation.findUnique({
    where: { chatSessionId },
    select: { id: true, status: true, chatSessionId: true },
  });

  // No ticket yet: nothing to mirror into. The first handoff replays the whole
  // transcript, so nothing said before it is lost.
  if (!conversation) return null;

  const open = conversation.status !== SupportConversationStatus.CLOSED;

  const message = await appendInbound({
    conversationId: conversation.id,
    author:
      line.role === ChatRole.USER ? SupportMessageAuthor.CUSTOMER : SupportMessageAuthor.BOT,
    body: line.content,
    attachments: attachmentsOf(line.imageUrl),
    externalId: windeeRef(line.id),
    createdAt: line.createdAt,
    countsAsUnread: open && line.role === ChatRole.USER,
  }).catch(() => null);

  // A duplicate `externalId` is the expected outcome when a replay and the
  // live mirror cover the same line; the transcript already has it.
  if (!message) return null;

  broadcastMessage(conversation, shapeMessage(message));
  await broadcastConversation(conversation.id);

  return message;
};
