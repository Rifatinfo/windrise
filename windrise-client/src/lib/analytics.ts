import type { ConsentState } from "@/lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Runs in <head> before hydration so Google Consent Mode v2 has a default
 * (denied) state established before gtag.js — or any other Google tag —
 * ever loads. This must stay inline; it cannot be deferred to a client effect.
 */
export const CONSENT_MODE_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
`.trim();

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
