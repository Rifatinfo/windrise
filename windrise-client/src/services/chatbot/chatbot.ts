/**
 * Windee's client. Every call carries a `visitorId` — the only identity a
 * signed-out shopper has — so a guest can track an order, place one, and get
 * their thread back after a reload.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/ai-conversation-chatbot`;
const VISITOR_KEY = "windee.visitorId";

export type ChatRole = "USER" | "ASSISTANT" | "TOOL";
export type SessionStatus = "ACTIVE" | "HANDED_OFF" | "CLOSED";

/** The structured payloads the transcript renders as cards. */
export type ChatCard =
  | { kind: "order"; orderNo: string; status: string; placedAt: string; totalAmount: number; paymentMethod: string; items: OrderLine[] }
  | { kind: "products"; title: string; products: ProductHit[] }
  | { kind: "confirm-order"; requiresConfirmation: true; items: DraftLine[]; subtotal: number; deliveryCharge: number; total: number; deliverTo: DeliverTo; paymentMethod: string }
  | { kind: "confirm-cancel"; requiresConfirmation: true; orderNo: string; total: number; items: string[] }
  | { kind: "order-placed"; orderNo: string | null; total: number | null; deliverTo: DeliverTo }
  | { kind: "order-cancelled"; orderNo: string | null; total: number | null }
  | { kind: "handoff" };

export type OrderLine = {
  id: string;
  productName: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  total: number;
  productImage: string | null;
};

export type ProductHit = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  slug: string;
  /** Both needed to build the storefront path; either may be missing. */
  category: string | null;
  subCategory: string | null;
  image: string | null;
  inStock: boolean;
};

/**
 * The storefront product route, matching how ProductCard builds it:
 * `/{category}/{subCategory}/{slug}`, falling back to the `/product` segment
 * when a product has no subcategory.
 *
 * Returns null when there is no category at all — a link to `/{slug}` would
 * fall through to the category route and render "Coming Soon" rather than the
 * product.
 */
export function productHref(product: {
  slug: string;
  category: string | null;
  subCategory: string | null;
}): string | null {
  if (!product.category) return null;

  const middle = product.subCategory
    ? encodeURIComponent(product.subCategory)
    : "product";

  return `/${encodeURIComponent(product.category)}/${middle}/${encodeURIComponent(
    product.slug,
  )}`;
}

export type DraftLine = {
  name: string;
  quantity: number;
  unit: number;
  total: number;
  size?: string;
  color?: string;
};

export type DeliverTo = { name: string; phone: string; state: string; address: string };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  card: ChatCard | null;
  imageUrl: string | null;
  createdAt: string;
};

export type ChatSession = {
  sessionId: string;
  name: string | null;
  phone: string | null;
  status: SessionStatus;
  resumed?: boolean;
  messages: ChatMessage[];
};

/**
 * A stable per-browser id. Generated once and kept in localStorage, which is
 * what lets a minimised chat come back with its history.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const minted =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `v${Date.now()}${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(VISITOR_KEY, minted);
    return minted;
  } catch {
    // Private mode or blocked storage: the chat still works, it just cannot be
    // resumed after a reload.
    return `v${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function forgetVisitor() {
  try {
    window.localStorage.removeItem(VISITOR_KEY);
  } catch {
    /* nothing to clean up */
  }
}

type ApiResponse<T> = { success: boolean; message: string; data: T };

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => ({}))) as Partial<ApiResponse<T>> & {
    message?: string;
  };

  if (!res.ok) throw new Error(payload.message ?? "Windee is unavailable right now.");
  return payload.data as T;
}

export const startChat = (visitorId: string, details?: { name?: string; phone?: string }) =>
  post<ChatSession>("/start", { visitorId, ...details });

export const sendChatMessage = (
  visitorId: string,
  sessionId: string,
  text: string,
  imageUrl?: string | null,
) => post<ChatMessage>("/message", { visitorId, sessionId, text, imageUrl });

/** Commits the order or cancellation Windee has proposed. */
export const confirmPending = (visitorId: string, sessionId: string) =>
  post<ChatMessage>("/confirm", { visitorId, sessionId });

export const declinePending = (visitorId: string, sessionId: string) =>
  post<ChatMessage>("/decline", { visitorId, sessionId });

export const requestHuman = (visitorId: string, sessionId: string) =>
  post<ChatMessage>("/human", { visitorId, sessionId });

export const resumeAi = (visitorId: string, sessionId: string) =>
  post<{ sessionId: string; status: SessionStatus }>("/resume-ai", { visitorId, sessionId });

/** Ends the chat and erases the transcript server-side. */
export const closeChat = (visitorId: string, sessionId: string) =>
  post<{ deleted: boolean }>("/close", { visitorId, sessionId });

export async function uploadChatImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(payload.message ?? "Couldn't upload that image.");
  return payload.data.url as string;
}

/**
 * Uploads live behind next.config's `/uploads` rewrite, so the path is used as
 * given — an absolute URL to the API host trips the server's cross-origin
 * resource policy and the image silently fails to load.
 */
export const chatMediaUrl = (path: string | null) => path || null;
