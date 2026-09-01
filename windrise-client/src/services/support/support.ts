/**
 * The support inbox client.
 *
 * Every call is cookie-authenticated as the signed-in agent — the same session
 * the rest of the dashboard uses — so nothing here carries a token of its own.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/support`;

export type SupportChannel =
  | "WINDEE"
  | "MESSENGER"
  | "WHATSAPP"
  | "INSTAGRAM"
  | "EMAIL"
  | "COMMENTS";

export type ConversationStatus = "IN_QUEUE" | "WITH_AGENT" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Presence = "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE";
export type MessageAuthor = "CUSTOMER" | "AGENT" | "BOT" | "SYSTEM";

export type Agent = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: string;
  title: string | null;
  presence: Presence;
  maxConcurrent: number;
  lastSeenAt: string | null;
  openConversations: number;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  location: string | null;
  userId: string | null;
};

export type Tag = { id: string; name: string; color: string };

export type Conversation = {
  id: string;
  ticketNo: string;
  channel: SupportChannel;
  status: ConversationStatus;
  priority: Priority;
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadForAgent: number;
  createdAt: string;
  closedAt: string | null;
  firstResponseAt: string | null;
  contact: Contact;
  queue: { id: string; name: string; slug: string } | null;
  assignedAgent: { id: string; name: string; avatar: string | null } | null;
  tags: Tag[];
};

export type Attachment = { url: string; name: string; mime: string; size?: number };

export type Message = {
  id: string;
  author: MessageAuthor;
  body: string;
  attachments: Attachment[];
  isInternalNote: boolean;
  deliveredAt: string | null;
  deliveryError: string | null;
  createdAt: string;
  agent: { id: string; name: string; avatar: string | null } | null;
};

export type RecentOrder = {
  id: string;
  orderNo: string;
  status: string;
  total: number;
  placedAt: string;
};

export type ConversationDetail = {
  conversation: Conversation;
  messages: Message[];
  customer: Contact & { recentOrders: RecentOrder[] };
  previousConversations: {
    id: string;
    ticketNo: string;
    channel: SupportChannel;
    status: ConversationStatus;
    lastMessageAt: string;
    lastMessagePreview: string;
  }[];
  /** Only while the conversation is still queued. */
  queue: { position: number; estimatedWaitSeconds: number | null } | null;
};

export type Stats = {
  openChats: number;
  inQueue: number;
  myChats: number;
  /** Threads waiting on this agent — drives the notification bell. */
  unreadConversations: number;
  resolvedToday: number;
  resolvedTrend: number | null;
  avgResponseSeconds: number | null;
  avgResponseWindow: "hour" | "today";
};

export type ChannelSummary = {
  total: number;
  channels: { channel: SupportChannel; count: number; connected: boolean }[];
};

export type QueueSummary = {
  total: number;
  queues: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isSystem: boolean;
    count: number;
  }[];
};

export type ListFilters = {
  channel?: SupportChannel;
  queueId?: string;
  status?: ConversationStatus;
  scope?: "all" | "mine" | "unassigned";
  unread?: boolean;
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
};

type Envelope<T> = { success: boolean; message: string; data: T; meta?: Meta };
export type Meta = { page: number; limit: number; total: number };

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...init });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const patch = (body: unknown): RequestInit => ({ ...json(body), method: "PATCH" });

// --- Agent -----------------------------------------------------------------

export const getMe = () => request<Agent>("/me").then((r) => r.data);
export const getAgents = () => request<Agent[]>("/agents").then((r) => r.data);

export const setPresence = (presence: Presence) =>
  request<Agent>("/me/presence", patch({ presence })).then((r) => r.data);

export const heartbeat = () => request<{ ok: boolean }>("/me/heartbeat", { method: "POST" });

// --- Dashboard -------------------------------------------------------------

export const getStats = () => request<Stats>("/stats").then((r) => r.data);
export const getChannels = () => request<ChannelSummary>("/channels").then((r) => r.data);
export const getQueues = () => request<QueueSummary>("/queues").then((r) => r.data);
export const getTags = () => request<Tag[]>("/tags").then((r) => r.data);

export const createQueue = (name: string, description?: string) =>
  request<QueueSummary["queues"][number]>("/queues", json({ name, description })).then(
    (r) => r.data,
  );

export const deleteQueue = (id: string) =>
  request<{ deleted: boolean }>(`/queues/${id}`, { method: "DELETE" });

// --- Conversations ---------------------------------------------------------

export const listConversations = async (filters: ListFilters) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) query.set(key, String(value));
  }

  const res = await request<Conversation[]>(`/conversations?${query.toString()}`);
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 20, total: 0 } };
};

export const getConversation = (id: string) =>
  request<ConversationDetail>(`/conversations/${id}`).then((r) => r.data);

export const markRead = (id: string) =>
  request<{ ok: boolean }>(`/conversations/${id}/read`, { method: "POST" });

export const claimConversation = (id: string) =>
  request<ConversationDetail>(`/conversations/${id}/claim`, { method: "POST" }).then(
    (r) => r.data,
  );

export const transferConversation = (
  id: string,
  target: { agentId?: string | null; queueId?: string | null; note?: string },
) =>
  request<ConversationDetail>(`/conversations/${id}/transfer`, json(target)).then((r) => r.data);

export const closeConversation = (id: string, reason?: string) =>
  request<ConversationDetail>(`/conversations/${id}/close`, json({ reason })).then((r) => r.data);

export const reopenConversation = (id: string) =>
  request<ConversationDetail>(`/conversations/${id}/reopen`, { method: "POST" }).then(
    (r) => r.data,
  );

export const setPriority = (id: string, priority: Priority) =>
  request<{ id: string; priority: Priority }>(
    `/conversations/${id}/priority`,
    patch({ priority }),
  ).then((r) => r.data);

export const sendReply = (
  id: string,
  payload: { body: string; attachments?: Attachment[]; isInternalNote?: boolean },
) => request<Message>(`/conversations/${id}/messages`, json(payload)).then((r) => r.data);

export const setTyping = (id: string, on: boolean) =>
  request<{ ok: boolean }>(`/conversations/${id}/typing`, json({ on })).catch(() => null);

export const addTag = (id: string, name: string) =>
  request<Tag>(`/conversations/${id}/tags`, json({ name })).then((r) => r.data);

export const removeTag = (id: string, tagId: string) =>
  request<{ ok: boolean }>(`/conversations/${id}/tags/${tagId}`, { method: "DELETE" });

export const uploadAttachment = async (file: File): Promise<Attachment> => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Couldn't upload that file.");
  return body.data as Attachment;
};

/**
 * Uploads are served through the client's own `/uploads` rewrite, so the stored
 * relative path is used as given — an absolute URL to the API host trips the
 * server's cross-origin resource policy and the image silently fails to load.
 */
export const mediaUrl = (path: string | null) => path || null;

/** The live event stream. Reconnection is handled by EventSource itself. */
export const streamUrl = () => `${BASE}/stream`;
