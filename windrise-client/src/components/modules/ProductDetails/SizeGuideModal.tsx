import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

type SizeGuideModalProps = {
  title: string
  image?: string | null
  sizes: string[]
  onClose: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const toSrc = (url: string) => (url.startsWith('http') ? url : `${API_URL}${url}`)

export function SizeGuideModal({ title, image, sizes, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow }
  }, [onClose])

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={`${title} size chart`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} onClick={(event) => event.stopPropagation()} className="relative w-full max-w-[470px]">
        <button type="button" onClick={onClose} aria-label="Close size guide" className="absolute -right-3 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.18)] hover:scale-105"><XIcon className="h-5 w-5" strokeWidth={1.8} /></button>
        <div className="max-h-[85vh] overflow-y-auto bg-white p-3"><div className="bg-[#f3f3f3] px-6 py-8 sm:px-9">
          <h2 className="text-center text-[17px] font-medium uppercase tracking-[0.02em] text-ink sm:text-[19px]">{title} size chart</h2>
          <span aria-hidden="true" className="mx-auto mt-2 block h-px w-[86%] bg-neutral-400/60" />
          {image && <img src={toSrc(image)} alt={`${title} measurement diagram`} className="mx-auto mt-6 block max-h-[260px] w-full max-w-[300px] object-contain" />}
          {sizes.length ? <div className="mt-7 grid grid-cols-2 gap-2 text-center">{sizes.map((size) => <div key={size} className="border border-neutral-400 bg-neutral-500 px-2 py-1.5 text-[11px] font-medium text-white">{size}</div>)}</div> : <p className="mt-7 text-center text-[12px] font-light text-muted">No size measurements are available for this product.</p>}
        </div></div>
      </motion.div>
    </motion.div>
  )
}
