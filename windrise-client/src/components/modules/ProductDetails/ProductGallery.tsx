import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { ProductImage } from '@/types/product'
import { ImageLightbox } from './ImageLightbox'
import { useImageSlider } from '@/components/shared/ImageSlider/useImageSlider'

type ProductGalleryProps = {
  images: ProductImage[]
  name: string
}

const HOVER_ZOOM = 2.1
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
// const toSrc = (url: string) => (url.startsWith('http') ? url : `${API_URL}${url}`)

/**
 * Details-page gallery.
 * - desktop: hover the main image to magnify, click to open the full viewer,
 *   click a thumbnail on the left to change image
 * - mobile / tablet: swipe the image, arrows and a thumbnail strip below
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const { trackRef, activeIndex, goTo, trackDragProps } = useImageSlider(
    Math.max(images.length, 1),
  )

  const select = (index: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, index))
    goTo(clamped)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (!images.length) {
    return <div className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-100 text-[12px] font-light text-muted lg:h-[min(800px,calc(100vh-190px))] lg:w-[min(640px,calc((100vh-190px)*0.8))]">No image available</div>
  }

  return (
    <div className="w-full">
      {/* ── mobile / tablet ─────────────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="relative w-full overflow-hidden bg-neutral-100 ">
          <div
            ref={trackRef}
            {...trackDragProps}
            className="gallery-track flex aspect-[4/5] w-full  overflow-x-auto "
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                 tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setLightboxOpen(true)}
                aria-label={`Open ${name} image ${index + 1} in full screen`}
                className="gallery-slide block h-full w-full min-w-full "
              >
                <img
                  src={image.url}
                  alt={name}
                  draggable={false}
                  className="h-full w-full  select-none object-cover rounded-sm"
                />
              </button>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                 onClick={() => select(activeIndex - 1)}
                 disabled={activeIndex === 0}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-ink/70 transition-opacity disabled:opacity-25"
              >
                <ChevronLeftIcon className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                 onClick={() => select(activeIndex + 1)}
                 disabled={activeIndex === images.length - 1}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-ink/70 transition-opacity disabled:opacity-25"
              >
                <ChevronRightIcon className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        <ul className="mt-3 flex items-center justify-center gap-2">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => select(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === activeIndex}
                className={`block h-[42px] w-[37px] overflow-hidden border transition-colors rounded-sm ${
                     index === activeIndex ? 'border-[1px] border-[#585858] ' : ''
                }`}
              >
                <img
                   src={image.url}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover "
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── desktop ─────────────────────────────────────────────────── */}
       <div className="hidden lg:flex lg:items-center lg:gap-8 ">
         <ul className="flex w-[78px]  shrink-0 flex-col gap-2">
           {images.map((image, index) => (
             <li key={image.id}>
               <button
                 type="button"
                 onClick={() => select(index)}
                 onMouseEnter={() => setHovering(false)}
                 aria-label={`Show image ${index + 1}`}
                 aria-current={index === activeIndex}
                 className={`block h-[60px] w-[68px] cursor-pointer overflow-hidden rounded-sm border transition-colors ${
                   index === activeIndex
                     ? 'border-[2px] border-[#585858] w-[72px] h-[67px] md:-ml-0.5 lg:-ml-0.5'
                     : ''
                 }`}
               >
                 <img src={image.url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
               </button>
             </li>
           ))}
         </ul>
         <div
          role="button"
          tabIndex={0}
          aria-label={`Open ${name} images in full screen`}
          onClick={() => setLightboxOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setLightboxOpen(true)
            }
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={handleMouseMove}
           style={{
             width: 'min(585px, calc((100vh - 190px) * 0.8003))',
           }}
            className="relative aspect-[585/731] min-w-0 flex-none cursor-zoom-in overflow-hidden bg-neutral-100 outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.img
               key={images[activeIndex].id}
               src={images[activeIndex].url}
               alt={name}
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full  select-none object-cover rounded-sm"
              style={{
                transform: `scale(${hovering ? HOVER_ZOOM : 1})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transition: 'transform 0.18s ease-out',
              }}
            />
          </AnimatePresence>

         </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={images}
             index={activeIndex}
            onChange={select}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
