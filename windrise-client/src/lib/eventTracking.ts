// Lightweight first-party funnel tracking for the admin Sales Funnel dashboard.
// Separate from src/lib/analytics.ts (Google Analytics) — this posts to our own
// backend so funnel counts don't depend on a third-party script loading/consent.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const SESSION_COOKIE = "windrise_sid";
const SESSION_TTL_MINUTES = 30;

export type AnalyticsEventType = "PAGE_VIEW" | "PRODUCT_VIEW" | "ADD_TO_CART" | "CHECKOUT_START";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, minutes: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getSessionId(): string {
  const existing = readCookie(SESSION_COOKIE);
  const id = existing ?? crypto.randomUUID();
  // Rolling TTL: every event refreshes the expiry so an active visit stays one session.
  writeCookie(SESSION_COOKIE, id, SESSION_TTL_MINUTES);
  return id;
}

export function trackEvent(type: AnalyticsEventType, payload?: { productId?: string }): void {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify({
      type,
      sessionId: getSessionId(),
      path: window.location.pathname,
      productId: payload?.productId,
    });

    fetch(`${API_URL}/api/v1/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => {
      // Event tracking must never break the storefront.
    });
  } catch {
    // ignore
  }
}
