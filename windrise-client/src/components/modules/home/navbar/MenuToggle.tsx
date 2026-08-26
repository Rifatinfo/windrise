'use client'

import { motion } from 'framer-motion'

/** Shared with the drawer so the icon and the panel move as one gesture. */
export const MENU_EASE = [0.32, 0.72, 0, 1] as const
export const MENU_DURATION = 0.55

/** Half the gap between the two bars when closed. */
const BAR_OFFSET = 4

/**
 * The two-bar menu button.
 *
 * A single button that stays mounted in the header, so the bars genuinely
 * rotate into the cross rather than one icon being swapped for another. Both
 * bars are centred in the button; when closed they sit `BAR_OFFSET` above and
 * below that centre, and opening converges them on it while rotating to +/-45.
 *
 * `bg-current` means the bars inherit the header's colour, which flips with
 * the transparent/dark header states.
 */
export function MenuToggle({
  isOpen,
  onClick,
  className = '',
}: {
  isOpen: boolean
  onClick: () => void
  className?: string
}) {
  const transition = { duration: MENU_DURATION, ease: MENU_EASE }
  const bar =
    'absolute h-[1.5px] w-[22px] rounded-full bg-current will-change-transform'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className={`relative inline-flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-60 ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className={bar}
        initial={false}
        animate={isOpen ? { y: 0, rotate: 45 } : { y: -BAR_OFFSET, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        aria-hidden="true"
        className={bar}
        initial={false}
        animate={isOpen ? { y: 0, rotate: -45 } : { y: BAR_OFFSET, rotate: 0 }}
        transition={transition}
      />
    </button>
  )
}
