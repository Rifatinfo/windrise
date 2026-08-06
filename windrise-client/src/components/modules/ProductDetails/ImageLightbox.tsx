import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import type { ProductImage } from '@/types/product'

type ImageLightboxProps = {
  images: ProductImage[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const BUTTON_STEP = 0.5
const WHEEL_STEP = 0.0025
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const toSrc = (url: string) => (url.startsWith('http') ? url : `${API_URL}${url}`)
const subscribeToHydration = () => () => {}
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * Full-screen viewer on a dark scrim:
 * - slide between images (arrows, keyboard, swipe)
 * - zoom with the +/- buttons or the mouse wheel, then drag to pan
 */
export function ImageLightbox({
  images,
  index,
  onChange,
  onClose,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [direction, setDirection] = useState(1)
  const [panning, setPanning] = useState(false)
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  )

  const stageRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  )
  const swipeRef = useRef<number | null>(null)

  const total = images.length

  const reset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const step = useCallback(
    (delta: number) => {
      if (total < 2) return
      setDirection(delta)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      onChange((index + delta + total) % total)
    },
    [index, onChange, total],
  )

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose, step])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  // wheel / trackpad zoom (native listener so it can block page scroll)
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((current) => {
        const next = clamp(current - event.deltaY * WHEEL_STEP, MIN_ZOOM, MAX_ZOOM)
        if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
        return next
      })
    }

    stage.addEventListener('wheel', handleWheel, { passive: false })
    return () => stage.removeEventListener('wheel', handleWheel)
  }, [])

  const changeZoom = (delta: number) => {
    setZoom((current) => {
      const next = clamp(current + delta, MIN_ZOOM, MAX_ZOOM)
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      panRef.current = {
        x: event.clientX,
        y: event.clientY,
        ox: offset.x,
        oy: offset.y,
      }
      setPanning(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    } else {
      swipeRef.current = event.clientX
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current
    if (!pan) return
    setOffset({
      x: pan.ox + (event.clientX - pan.x),
      y: pan.oy + (event.clientY - pan.y),
    })
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panRef.current) {
      panRef.current = null
      setPanning(false)
      return
    }
    const start = swipeRef.current
    swipeRef.current = null
    if (start === null) return
    const delta = event.clientX - start
    if (Math.abs(delta) > 45) step(delta < 0 ? 1 : -1)
  }

  const iconButton =
    'text-white/85 transition-opacity hover:text-white disabled:opacity-30'

  if (!mounted) return null

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[2147483647] flex h-screen w-screen min-h-[100dvh] min-w-full items-center justify-center bg-black/80 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* controls */}
      <div
        className="absolute right-4 top-4 z-20 flex items-center gap-4 sm:right-6 sm:top-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => changeZoom(BUTTON_STEP)}
          disabled={zoom >= MAX_ZOOM}
          className={iconButton}
        >
          <ZoomInIcon className="h-6 w-6" strokeWidth={1.4} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => changeZoom(-BUTTON_STEP)}
          disabled={zoom <= MIN_ZOOM}
          className={iconButton}
        >
          <ZoomOutIcon className="h-6 w-6" strokeWidth={1.4} />
        </button>
        <button
          type="button"
          aria-label="Close viewer"
          onClick={onClose}
          className={iconButton}
        >
          <XIcon className="h-7 w-7" strokeWidth={1.4} />
        </button>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation()
              step(-1)
            }}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 p-2 text-white/85 transition-opacity hover:text-white sm:left-5"
          >
            <ChevronLeftIcon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.2} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation()
              step(1)
            }}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 p-2 text-white/85 transition-opacity hover:text-white sm:right-5"
          >
            <ChevronRightIcon
              className="h-7 w-7 sm:h-9 sm:w-9"
              strokeWidth={1.2}
            />
          </button>
        </>
      )}

      {/* stage */}
      <div
        ref={stageRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden px-10 py-12 sm:px-20"
        onClick={onClose}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2))}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          cursor: zoom > 1 ? (panning ? 'grabbing' : 'grab') : 'zoom-in',
          touchAction: 'none',
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={images[index].id}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none flex h-full w-full items-center justify-center"
          >
            <img
              src={images[index].url}
              alt="Product image"
              draggable={false}
              className="pointer-events-auto max-h-full max-w-full select-none object-contain"
              onClick={(event) => event.stopPropagation()}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center',
                transition: panning ? 'none' : 'transform 0.2s ease-out',
                willChange: 'transform',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] font-light text-white/70">
          {index + 1} / {total}
        </p>
      )}
    </motion.div>,
    document.body,
  )
}
