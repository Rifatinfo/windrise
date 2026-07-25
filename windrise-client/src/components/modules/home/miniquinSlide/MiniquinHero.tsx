'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ModelCard } from './ModelCard'
import { MobileLookbook } from './MobileLookbook'
import { SliderControls } from './SliderControls'
import { MODELS } from './data/model';
import { ringOffset, wrapIndex } from './data/slide';
import { CollectionShowcase } from '../showCase/CollectionShowcase';



function useCanvasScale() {
  const [canvasScale, setCanvasScale] = useState(1)
  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth
      setCanvasScale(Math.min(1, Math.max(0.52, width / 1699)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])
  return canvasScale
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isMobile
}

export function MiniquinHero() {
  const total = MODELS.length
  const [active, setActive] = useState(0)
  const canvasScale = useCanvasScale()
  const isMobile = useIsMobile()

  const pointerStartX = useRef<number | null>(null)
  const didDrag = useRef(false)

  const goTo = useCallback(
    (index: number) => {
      if (didDrag.current) return
      setActive((current) => (current === index ? current : wrapIndex(index, total)))
    },
    [total],
  )

  const next = useCallback(() => setActive((current) => wrapIndex(current + 1, total)), [total])
  const prev = useCallback(() => setActive((current) => wrapIndex(current - 1, total)), [total])

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
    didDrag.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return
    if (Math.abs(event.clientX - pointerStartX.current) > 10) didDrag.current = true
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return
    const dragDistance = event.clientX - pointerStartX.current
    if (Math.abs(dragDistance) > 48) (dragDistance < 0 ? next : prev)()
    pointerStartX.current = null
    window.setTimeout(() => {
      didDrag.current = false
    }, 0)
  }

  const activeModel = MODELS[active]

  const infoBlock = (
    <motion.div
      key={activeModel.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="pointer-events-auto w-[176px] text-center sm:text-left"
    >
      <p className="text-[13px] lg:text-xl font-medium tracking-[0.04em] text-ink">
        {activeModel.category}
      </p>
      <p className="mt-2 text-[12px] md:text-lg lg:text-lg leading-[1.45] text-ink/50 text-[#7D7D7D]">
        Soft where it matters. Made for the rhythm of everyday life.
      </p>

      <a
        href="#"
        className="group mt-3 inline-flex items-center justify-center gap-2 border-transparent pb-0.5 text-[13.5px] font-light transition-[gap] duration-200 hover:gap-3 hover:border-[#1C1B1A] sm:mt-4 sm:justify-start sm:text-[15px] lg:text-[16px]"
      >
        Discover
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M6 3.5L10.5 8L6 12.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </motion.div>
  )

  return (
    <section
      className="relative w-full overflow-hidden bg-warmwhite"
      style={{
  background: "linear-gradient(180deg, #F3F0E8 0%, #FFFFFF 100%)",
}}
      aria-roledescription="carousel"
      aria-label="Featured looks"
    >
      <div className="relative mx-auto flex min-h-[660px] w-full max-w-[1699px] flex-col sm:block sm:h-[max(700px,69.63vw)] sm:max-h-[1183px] sm:min-h-[700px]">
        <div
          className="pointer-events-none absolute left-1/2 top-[28%] lg:top-[26%] z-0 w-[80%] -mx-7 -translate-x-1/2 select-none sm:left-[-2%] sm:top-[26%] sm:w-[46%] sm:translate-x-0"
          aria-hidden="true"
        >
          {/* <img
            src="/assets/WRWatermark.png"
            alt=""
            className="block w-full sepia-[0.2]"
          /> */}
        </div>
        <img
          src="https://cdn.magicpatterns.com/uploads/dhbGLHSMuu9HSs3nKXbDvm/W.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 lg:top-[40%] z-0 w-[100%] -translate-x-1/2 select-none opacity-[2.12] top-[36%] sm:w-[48%] sm:opacity-[2.12]"
        />

        {/* ---- Heading ---- */}
        <header className="relative z-[150] px-6 pt-24 text-center sm:absolute sm:left-[10%] sm:top-[8.2%]  lg:mt-10 sm:w-[870px] sm:max-w-[56vw] sm:px-0 sm:pt-0 sm:text-left">
          <h1 className="font-serif-display text-2xl leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl sm:leading-[0.93] lg:text-6xl">
            Designed for the moments
            <span className="block text-[#B3A08E]">you live every day.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[12px] leading-[1.5] text-ink/70 sm:mx-0 sm:mt-5 sm:max-w-[615px] sm:text-xl">
            Versatile pieces made to bring comfort, confidence and simplicity wherever life takes you.
          </p>
        </header>

        {/* ---- Slider stage ---- */}
        <div
          className="relative  flex-none cursor-grab select-none active:cursor-grabbing sm:absolute sm:inset-x-0 sm:bottom-[8.3%] sm:top-[26%] sm:mt-0 sm:min-h-0 sm:flex-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="h-full sm:hidden">
            <MobileLookbook active={active} onSelect={goTo} />
          </div>
          <div className="relative hidden h-full w-full sm:block" aria-live="polite">
            {MODELS.map((model, i) => {
              const distance = ringOffset(i, active, total)
              return (
                <ModelCard
                  key={model.id}
                  model={model}
                  distance={distance}
                  canvasScale={canvasScale}
                  isMobile={false}
                  onSelect={() => goTo(i)}
                />
              )
            })}
          </div>

          <div className="hidden sm:block">
            <SliderControls onPrev={prev} onNext={next} />
          </div>
        </div>

        {/* ---- Info block: centered below on mobile, floating right on desktop ---- */}
        <div className="relative z-[150] mt-[90px] flex justify-center px-6 pb-8 pt-0 sm:mt-0 sm:hidden">
          {infoBlock}
          <SliderControls onPrev={prev} onNext={next} />
        </div>
        <div className="pointer-events-none absolute bottom-[17%] right-[12.3%] z-[150] hidden sm:block">
          {infoBlock}
        </div>
      </div>
    </section>
  )
}

