import Image from "next/image";

import { Breadcrumb } from "./Breadcrumb";

/**
 * The full-screen masthead.
 *
 * Two crops of the same illustration, because the two layouts need different
 * framing. The wide artwork is 1920x945 on a #F8F9F4 ground with the figure at
 * x 13-44% (centre 28.6%) and 80% of the height; the phone crop is 375x464 on
 * #F6F9F1 with the figure filling it. Each section's background is set to its
 * artwork's exact ground colour so the two meet without a seam at any aspect
 * ratio — a full-bleed hero has no margin to hide a mismatch in.
 *
 * Desktop lays the figure and wordmark side by side, the figure nudged to
 * about a third across by `object-position` so the right side stays clear.
 * Below `md` they stack, which is the only way both stay legible on a phone.
 *
 * Type is sized in `cqw` — a share of the hero's own width — with clamps that
 * keep it readable at the extremes.
 */
export function StoriesHero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#F8F9F4]"
      style={{ containerType: "inline-size" }}
    >
      {/* Clears the fixed site header — 64px on phones, 80px from lg up. The
          trail is in normal flow now, so this wrapper owns the whole offset. */}
      <div className="absolute left-4 top-20 z-50 md:left-20 md:top-[88px]">
        <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Stories" }]} />
      </div>

      {/* ---------------------------- Desktop ---------------------------- */}
      <div className="relative hidden min-h-screen w-full md:block">
        <Image
          src="/assets/blog-header.png"
          alt=""
          width={1920}
          height={945}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[20%_50%]"
        />

        {/* Centred at ~60% across — the clear half the figure leaves. */}
        <div className="absolute inset-y-0 left-[34%] right-[14%] flex flex-col items-center justify-center text-center">
          <h1 className="font-dm-sans leading-[0.9] text-[#1C1B1A]">
            <span
              className="block font-normal tracking-[0.01em] text-[#827C5A] font-dm-sans"
              style={{ fontSize: "clamp(24px, 4.1cqw, 63px)" }}
            >
              The Windrise
            </span>
            <span
              className="block font-normal tracking-[0.01em]"
              style={{ fontSize: "clamp(34px, 5.7cqw, 63px)" }}
            >
              Stories
            </span>
          </h1>

          <p
            className="mt-[1.8cqw] max-w-[30em]  leading-[1.6] "
            style={{ fontSize: "clamp(11px, 1.35cqw, 22px)" }}
          >
            Discover stories, perspectives, and inspiration from the world of
            fashion, culture, and contemporary life.
          </p>
        </div>
      </div>

      {/* ----------------------------- Mobile ---------------------------- */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9F4] px-6 pb-10 pt-20 text-center md:hidden">
        <Image
          src="/assets/blogs-cover-mobile.png"
          alt=""
          width={375}
          height={464}
          priority
          aria-hidden="true"
          // The height cap keeps the whole hero inside a short viewport
          // instead of pushing the wordmark below the fold.
          className="pointer-events-none h-auto max-h-[50vh] w-full max-w-[360px] select-none object-contain"
        />

        <h1 className="mt-6 font-display leading-[1.0] text-[#1C1B1A]">
          <span
            className="block font-normal tracking-[0.01em] text-[#5C5A54]"
            style={{ fontSize: "clamp(19px, 5.9cqw, 34px)" }}
          >
            The Windrise
          </span>
          <span
            className="block font-semibold tracking-[0.01em]"
            style={{ fontSize: "clamp(28px, 9cqw, 52px)" }}
          >
            Stories
          </span>
        </h1>

        <p
          className="mt-3 max-w-[18em] font-serif leading-[1.55] text-[#5C5A54]"
          style={{ fontSize: "clamp(10px, 3.1cqw, 17px)" }}
        >
          Discover stories, perspectives, and inspiration from the world of
          fashion, culture, and contemporary life.
        </p>
      </div>
    </section>
  );
}
