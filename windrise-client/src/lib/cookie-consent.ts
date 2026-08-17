import { parse, serialize } from "cookie";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 6 months
const OPEN_PREFERENCES_EVENT = "cookie-consent:open-preferences";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean"
  );
}

/** Reads and validates the consent cookie. Returns null if missing/invalid. Client-only. */
export function getStoredConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;

  try {
    const cookies = parse(document.cookie);
    const raw = cookies[CONSENT_COOKIE_NAME];
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persists consent choices to a first-party cookie. Never throws — tracking prefs must not break the app. */
export function persistConsent(consent: ConsentState): void {
  if (typeof document === "undefined") return;

  try {
    document.cookie = serialize(CONSENT_COOKIE_NAME, JSON.stringify(consent), {
      maxAge: CONSENT_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // Consent cookie write failed (e.g. storage disabled). Tracking simply stays off this session.
  }
}

/** Opens the Cookie Preferences panel from anywhere in the app (e.g. a footer link). */
export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}

/** Subscribes to openCookiePreferences() calls. Returns an unsubscribe function. */
export function onOpenCookiePreferences(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_PREFERENCES_EVENT, callback);
  return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, callback);
}
