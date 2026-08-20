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
      className="group inline-flex items-center gap-2 rounded-full border border-black bg-transparent px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-transparent focus-visible:ring-2 focus-visible:ring-white/80 sm:px-6 sm:py-1.5 sm:text-base cursor-pointer"
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
