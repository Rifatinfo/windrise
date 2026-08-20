"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

import {
  ConsentState,
  DEFAULT_CONSENT,
  getStoredConsent,
  onOpenCookiePreferences,
  persistConsent,
} from "@/lib/cookie-consent";
import {
  ensureConsentModeDefault,
  initGoogleAnalytics,
  updateGoogleConsent,
} from "@/lib/analytics";
import { buildMetaPixelSnippet } from "@/lib/meta-pixel";
import { CookiePreferences } from "./CookiePreferences";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_PIXEL_SNIPPET = META_PIXEL_ID ? buildMetaPixelSnippet(META_PIXEL_ID) : null;

// Consent Mode v2 must default to denied before any Google tag below can load.
// Running it here, at chunk evaluation, guarantees that ordering on every page
// — including ones reached through notFound(), where React re-renders the root
// layout on the client and would never execute an inline <script>.
ensureConsentModeDefault();

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(stored);
      updateGoogleConsent(stored);
    } else {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => onOpenCookiePreferences(() => setPreferencesOpen(true)), []);

  function applyConsent(next: ConsentState) {
    setConsent(next);
    persistConsent(next);
    updateGoogleConsent(next);
    setShowBanner(false);
    setPreferencesOpen(false);
  }

  return (
    <>
      {consent.analytics && GA_MEASUREMENT_ID && (
        <Script
          id="ga4-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
          onReady={() => initGoogleAnalytics(GA_MEASUREMENT_ID)}
        />
      )}

      {consent.marketing && META_PIXEL_SNIPPET && (
        <Script
          id="meta-pixel-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: META_PIXEL_SNIPPET }}
        />
      )}



      {showBanner && (
        <div
          role="region"
          aria-label="Cookie notice"
          className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4 sm:bottom-4 sm:px-6 lg:bottom-[14px]"
        >
          <div className="pointer-events-auto flex w-full max-w-[560px] flex-col gap-4 rounded-[14px] bg-white px-5 py-4 shadow-[0_8px_34px_rgba(0,0,0,0.16)] sm:max-w-[900px] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-[18px] lg:max-w-[1100px] lg:px-[30px]">
            <p className="text-[12px] leading-[1.45] text-[#111111] sm:text-[12px] lg:text-[13px]">
              This site uses cookies. By clicking on Accept or continuing to browse
              the site, you authorize their use.{" "}
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="underline underline-offset-2 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Click here
              </button>
              .
            </p>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => applyConsent({ necessary: true, analytics: true, marketing: true })}
                className="rounded-full bg-[#0b0b0b] px-8 py-[9px] text-[12px] font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:text-[13px]"
              >
                Accept
              </button>

              <button
                type="button"
                onClick={() => applyConsent({ necessary: true, analytics: false, marketing: false })}
                className="rounded-full border border-[#0b0b0b] px-8 py-[9px] text-[12px] font-medium text-[#0b0b0b] transition-colors hover:bg-[#0b0b0b] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:text-[13px]"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <CookiePreferences
          consent={consent}
          onSave={applyConsent}
          onClose={() => setPreferencesOpen(false)}
        />
      )}
    </>
  );
}
