import React, { useCallback, useRef, useState } from 'react'

type SlideBarProps = {
  count: number
  activeIndex: number
  onSelect: (index: number, instant?: boolean) => void
  label?: string
}

/**
 * Thin segmented bar pinned to the bottom of an image.
 * - click a segment to jump to that image
 * - press and drag (scrub) across the bar; cursor is pointer, then grabbing
 * - works with touch as well as mouse and keyboard
 */
export function SlideBar({
  count,
  activeIndex,
  onSelect,
  label = 'Image',
}: SlideBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const indexFromX = useCallback(
    (clientX: number) => {
      const bar = barRef.current
      if (!bar) return 0
      const rect = bar.getBoundingClientRect()
      const ratio = (clientX - rect.left) / rect.width
      return Math.max(0, Math.min(count - 1, Math.floor(ratio * count)))
    },
    [count],
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    barRef.current?.setPointerCapture(event.pointerId)
    setIsDragging(true)
    onSelect(indexFromX(event.clientX), true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    event.stopPropagation()
    const next = indexFromX(event.clientX)
    if (next !== activeIndex) onSelect(next, true)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    barRef.current?.releasePointerCapture(event.pointerId)
    setIsDragging(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowDown: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      ArrowUp: activeIndex - 1,
      Home: 0,
      End: count - 1,
    }
    if (event.key in map) {
      event.preventDefault()
      onSelect(map[event.key])
    }
  }

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label={`${label} slider`}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={activeIndex + 1}
      aria-valuetext={`${label} ${activeIndex + 1} of ${count}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onKeyDown={handleKeyDown}
      className={`cursor-slider group/bar flex touch-none select-none items-center gap-[8px] py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-white/80 ${
        isDragging ? 'is-dragging' : ''
      }`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex
        return (
          <span
            key={index}
            aria-hidden="true"
            className="flex h-2.5 flex-1 items-center"
          >
            <span
              className={`block lg:h-[4px] h-[2px] w-full cursor-pointer rounded-full transition-colors duration-200 ${
                isActive ? 'bg-black/40 backdrop-blur-md' : 'bg-white group-hover/bar:bg-white'
              }`}
              style={{ transform: isActive ? 'scaleY(1.5)' : undefined }}
            />
          </span>
        )
      })}
    </div>
  )
}
