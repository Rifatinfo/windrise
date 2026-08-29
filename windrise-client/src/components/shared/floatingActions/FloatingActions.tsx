"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { WindeeWidget } from "@/components/modules/chatbot/WindeeWidget";

/** How long after the last scroll event the page counts as settled. */
const SETTLE_MS = 550;

/**
 * True while the page is being scrolled, false once it has come to rest.
 *
 * The flag is only ever set from inside the scroll listener and the timer, so
 * nothing is written during render.
 */
function useIsScrolling() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timer = 0;

    const onScroll = () => {
      setIsScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsScrolling(false), SETTLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return isScrolling;
}

/**
 * The two controls that ride along the right edge of every storefront page:
 * Windee and the jump-to-top button.
 *
 * Fixed at every size. On phones they get out of the way while the page is
 * moving — tucked half off the right edge — and slide fully into view once
 * scrolling stops, so they are always completely reachable at rest. From `sm`
 * up there is room for them either way, so they simply stay put.
 *
 * Both sit in the same 56px box even though Windee's artwork is 46px. Sizing
 * each button to its own artwork right-aligned them but left their centres 5px
 * apart, and a `translate-x-1/2` tuck then moved them by different amounts, so
 * they were out of line at rest *and* mid-tuck. A shared box aligns the centres
 * and makes the tuck identical; each icon still shows exactly half, because a
 * centred icon is cut by its own half when its box is.
 *
 * Layered below the site header (z-9999) and the mobile drawer (z-9995), so an
 * open menu covers them rather than the other way round.
 */
export function FloatingActions() {
  const isScrolling = useIsScrolling();

  // The panel lives here rather than in the layout so it can animate out of
  // the button it belongs to, and so minimising is just this flag going false
  // — the widget keeps its session and picks the conversation back up.
  const [chatOpen, setChatOpen] = useState(false);

  const jumpToTop = useCallback(() => {
    // `smooth` is ignored for anyone who prefers reduced motion — the browser
    // honours that setting for scroll behaviour on its own.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Both `translate-x-*` and `scale-*` compile to their own CSS properties in
  // Tailwind v4 — not to `transform` — so both have to be named here or
  // neither the tuck nor the press animates.
  const base =
    "pointer-events-auto grid place-items-center rounded-full transition-[translate,scale] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7FD4] focus-visible:ring-offset-2";

  /** Tucked only while the page is moving, and only on phones. */
  const tuck = `${isScrolling ? "translate-x-1/2" : "translate-x-0"} sm:translate-x-0`;

  return (
    <>
      <WindeeWidget open={chatOpen} onClose={() => setChatOpen(false)} />

    <div
      className="pointer-events-none fixed bottom-6 right-0 z-[9000] flex flex-col items-center gap-1.5 sm:right-5 md:bottom-8"
      role="group"
      aria-label="Quick actions"
    >
      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        aria-label="Chat with Windee"
        aria-expanded={chatOpen}
        title="Chat with Windee"
        className={`${base} ${tuck} h-[56px] w-[56px]`}
      >
        <Image
          src="/assets/Windee-Chatbot.png"
          alt=""
          aria-hidden="true"
          width={46}
          height={46}
          // Centred in the shared 56px box at its own size, not stretched.
          className="pointer-events-none h-[46px] w-[46px] select-none"
        />
      </button>

      <button
        type="button"
        onClick={jumpToTop}
        aria-label="Back to top"
        title="Back to top"
        className={`${base} ${tuck} h-[56px] w-[56px]`}
      >
        <Image
          src="/assets/Jump-Button.png"
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          className="pointer-events-none h-full w-full select-none"
        />
      </button>
    </div>
    </>
  );
}
