"use client";

import { motion, type Variants } from "framer-motion";

/**
 * Scroll reveal for storefront content.
 *
 * Native scrolling is left alone — only the content animates. That matters
 * here: the site header hides on scroll, the blog sidebar is `sticky`, and the
 * mobile drawer locks `body` overflow. A scroll-hijacking library would have
 * to be reconciled with all three; this cannot interfere with any of them.
 *
 * Everything settles to `opacity: 1` and no offset, and each element only ever
 * plays once, so a reader scrolling back up is not re-animated at.
 *
 * Reduced motion is handled in CSS, not here: `prefers-reduced-motion` is
 * unknown during SSR and the first client render, so a JS branch renders the
 * animated element first and then swaps it out — leaving behind the inline
 * `opacity: 0` framer-motion wrote imperatively, which React has no record of
 * and never clears. The content stays invisible forever. The rule keyed to
 * `[data-reveal]` in globals.css has no such timing hole.
 */

/** Slow out, matching the nav's easing so the site moves consistently. */
const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.65;

/** How far into view an element must come before it starts. */
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds to hold before starting — for hand-tuned sequences. */
  delay?: number;
  /** Travel distance in px. 0 gives a plain fade. */
  y?: number;
}) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

/**
 * A run of siblings that come in one after another rather than together —
 * a grid of cards, a list of links.
 *
 * The stagger is driven by the parent, so the children need no delay maths and
 * stay correct however many there are.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      {children}
    </motion.div>
  );
}

/** One member of a {@link RevealGroup}. Inert outside one. */
export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div data-reveal="" className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
