import type { ConsentState } from "@/lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Set once the Consent Mode v2 defaults have been pushed. */
    __consentModeDefaultSet?: boolean;
  }
}

/**
 * Establishes the Google Consent Mode v2 default (denied) state.
 *
 * This runs at module-evaluation time of the client chunk that owns every
 * Google tag (`CookieConsent`), so it is always in place before gtag.js — or
 * any other Google tag — can be requested. It deliberately does NOT go through
 * `next/script` with `strategy="beforeInteractive"`: that renders a real
 * `<script>` element into the React tree, and React never executes script tags
 * it creates on the client, so the defaults silently never applied on pages
 * reached through `notFound()`.
 *
 * If a Google tag is ever added directly to the document <head>, this bootstrap
 * has to move back into the HTML ahead of it.
 *
 * Idempotent — safe to call more than once.
 */
export function ensureConsentModeDefault(): void {
  if (typeof window === "undefined" || window.__consentModeDefaultSet) return;
  window.__consentModeDefaultSet = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

let gaInitialized = false;

/** Pushes the gtag('config', ...) command. Safe to call multiple times — only runs once. */
export function initGoogleAnalytics(measurementId: string): void {
  if (gaInitialized || typeof window === "undefined" || !window.gtag) return;
  gaInitialized = true;

  try {
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  } catch {
    // Analytics must never break the app.
  }
}

/** Updates Google Consent Mode v2 signals. Safe to call before gtag.js has loaded — commands queue in dataLayer. */
export function updateGoogleConsent(consent: ConsentState): void {
  if (typeof window === "undefined" || !window.gtag) return;

  try {
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });
  } catch {
    // Analytics must never break the app.
  }
}
