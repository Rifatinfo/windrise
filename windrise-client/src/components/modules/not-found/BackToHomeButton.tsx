"use client";
import { motion } from 'framer-motion'
import { ChevronLeftIcon } from 'lucide-react'

type BackToHomeButtonProps = {
  onClick?: () => void
}

export function BackToHomeButton({ onClick }: BackToHomeButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    window.location.href = '/'
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center gap-2 rounded-[24px] bg-neutral-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-neutral-900/15 outline-none transition-colors  lg:text-lg md:text-lg"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <ChevronLeftIcon
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
        aria-hidden="true"
      />
      Back to Home
    </motion.button>
  )
}
