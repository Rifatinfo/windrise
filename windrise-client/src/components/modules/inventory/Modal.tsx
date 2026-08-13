import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: React.ReactNode
  width?: string
}

export function Modal({ open, onClose, labelledBy, children, width = 'max-w-[560px]' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className={`relative flex max-h-[88vh] w-full ${width} flex-col overflow-hidden rounded-3xl bg-white shadow-pop`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 z-10 rounded-xl bg-canvas p-2 text-slate-500 transition-colors duration-150 hover:bg-line hover:text-ink"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </motion.div>
    </div>
  )
}
