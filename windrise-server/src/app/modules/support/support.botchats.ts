/**
 * Browsing Windee conversations that never reached a person.
 *
 * A visitor who only ever talks to the bot has no ticket, and deliberately so:
 * turning every "hi" into a support conversation would bury the queue, inflate
 * the counters and set the notification bell off for work nobody has to do.
 * But the transcripts are still worth reading — what people ask the bot, and
 * what it answered, is the best record of what the shop is being asked for.
 *
 * So the listing reads the chat log directly rather than creating tickets: it
 * touches no queue, no assignment and no unread state, and browsing a chat
 * cannot make it into work.
 *
 * The one write path is `takeOverBotChat` — an agent deciding to step in. That
 * is deliberate and explicit, and it goes through the ordinary handoff and
 * claim so a taken-over chat is an ordinary ticket from that moment on.
 */

import { ChatRole, ChatSessionStatus, Prisma, SupportEventType } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { recordEvent } from "./support.core";
import { handoffWindeeSession } from "./support.ingest";
import { claimConversation } from "./support.service";

/** Tool rows are machine plumbing, and empty turns carry nothing to read. */
const visibleMessage: Prisma.ChatMessageWhereInput = {
  role: { in: [ChatRole.USER, ChatRole.ASSISTANT] },
  content: { not: "" },
};

export type BotChatFilters = {
  search?: string;
  /** Hide the ones that became tickets; those live in the inbox proper. */
  onlyWithoutTicket?: boolean;
  page?: number;
  limit?: number;
};

const listInclude = {
  // One lateral fetch for the preview rather than a query per row.
  messages: {
    where: visibleMessage,
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { content: true, role: true, createdAt: true },
  },
  supportConversation: { select: { id: true, ticketNo: true, status: true } },
  _count: { select: { messages: { where: visibleMessage } } },
} satisfies Prisma.ChatSessionInclude;

const shape = (
  row: Prisma.ChatSessionGetPayload<{ include: typeof listInclude }>,
) => {
  const last = row.messages[0];

  return {
    id: row.id,
    visitorId: row.visitorId,
    name: row.name,
    phone: row.phone,
    status: row.status,
    messageCount: row._count.messages,
    lastMessage: last
      ? {
          preview: last.content.slice(0, 160),
          from: last.role === ChatRole.USER ? ("CUSTOMER" as const) : ("WINDEE" as const),
          at: last.createdAt,
        }
      : null,
    // Present when this chat has already been handed to a person; the inbox
    // holds the full thread from there.
    ticket: row.supportConversation
      ? {
          conversationId: row.supportConversation.id,
          ticketNo: row.supportConversation.ticketNo,
          status: row.supportConversation.status,
        }
      : null,
    startedAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const listBotChats = async (filters: BotChatFilters = {}) => {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const term = filters.search?.trim();

  const where: Prisma.ChatSessionWhereInput = {
    // A session with nothing said in it is a widget that was opened and shut.
    messages: { some: visibleMessage },
    ...(filters.onlyWithoutTicket ? { supportConversation: { is: null } } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
            { messages: { some: { ...visibleMessage, content: { contains: term, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.chatSession.findMany({
      where,
      include: listInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chatSession.count({ where }),
  ]);

  return { data: rows.map(shape), meta: { page, limit, total } };
};

export const getBotChat = async (sessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      ...listInclude,
      messages: {
        where: visibleMessage,
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, imageUrl: true, createdAt: true },
      },
    },
  });

  if (!session) throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");

  return {
    chat: shape({ ...session, messages: [...session.messages].reverse().slice(0, 1) } as never),
    messages: session.messages.map((m) => ({
      id: m.id,
      from: m.role === ChatRole.USER ? ("CUSTOMER" as const) : ("WINDEE" as const),
      body: m.content,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt,
    })),
  };
};

/**
 * An agent stepping into a Windee chat uninvited.
 *
 * Until now a chat only reached a person because the customer asked. This is
 * the other direction: someone reading a bot conversation can see it going
 * wrong — a question Windee keeps missing, an order about to be placed with
 * the wrong size — and take it over there and then.
 *
 * Three things have to happen together, or the takeover is worse than
 * nothing:
 *
 *  1. A ticket exists, carrying the whole bot transcript, so the agent is not
 *     answering a conversation they cannot see.
 *  2. The chat session flips to HANDED_OFF. This is the one that matters:
 *     without it Windee keeps answering, and the customer gets a bot and a
 *     person talking over each other.
 *  3. The customer is told. Their widget is showing a bot conversation, and a
 *     stranger replying into it with no explanation is alarming.
 *
 * Claiming goes through the normal `claimConversation`, so an agent cannot
 * take a chat a colleague is already handling.
 */
export const takeOverBotChat = async (userId: string, chatSessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: chatSessionId },
    select: { id: true, status: true },
  });

  if (!session) throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");

  if (session.status === ChatSessionStatus.CLOSED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "That chat has been closed by the customer, so it can't be taken over.",
    );
  }

  const conversation = await handoffWindeeSession(chatSessionId);
  if (!conversation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "That chat couldn't be opened as a ticket.");
  }

  // Before the claim, so Windee has already stopped answering by the time the
  // customer is told a person has joined.
  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: { status: ChatSessionStatus.HANDED_OFF },
  });

  await recordEvent(conversation.id, SupportEventType.ASSIGNED, null, {
    source: "agent-takeover",
  });

  // Does the assignment, the transcript note, the customer notification and
  // the broadcast — and refuses if someone else already has it.
  return claimConversation(userId, conversation.id);
};

export const BotChatService = { listBotChats, getBotChat, takeOverBotChat };
