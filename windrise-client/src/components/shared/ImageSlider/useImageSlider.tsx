"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react'

type TrackDragProps = {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void
  onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => void
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void
}

type ImageSliderApi = {
  trackRef: React.RefObject<HTMLDivElement | null>
  activeIndex: number
  goTo: (index: number, instant?: boolean) => void
  next: () => void
  prev: () => void
  /** Spread on the scroll track: drag anywhere on the image to change it. */
  trackDragProps: TrackDragProps
}

/** movement (px) before a press counts as a drag rather than a click */
const DRAG_THRESHOLD = 3
/** a slight swipe — 6% of the card — is enough to advance an image */
const SLIGHT_SWIPE_RATIO = 0.06
/** px per ms — a quick flick advances regardless of distance */
const FLICK_VELOCITY = 0.35
/** snap animation length */
const SNAP_DURATION = 420

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Drives one image track:
 * - click / scrub the thin bar (pointer + grabbing cursor)
 * - drag anywhere on the image with a mouse; cursor stays normal
 * - the smallest swipe glides to the next image with an eased animation
 * - touch keeps native CSS scroll-snap so mobile feels native
 */
export function useImageSlider(count: number): ImageSliderApi {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const dragRef = useRef<{
    pointerId: number
    startX: number
    lastX: number
    lastTime: number
    velocity: number
    startScroll: number
    moved: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)
  const animationRef = useRef(0)
  const rafRef = useRef(0)
  const pendingScrollRef = useRef<number | null>(null)

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
  }, [])

  /** eased scroll to a slide — smoother and snappier than native 'smooth' */
  const animateTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return
      stopAnimation()

      const target = index * track.clientWidth
      const from = track.scrollLeft
      const distance = target - from
      if (Math.abs(distance) < 1) {
        track.scrollLeft = target
        return
      }

      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / SNAP_DURATION)
        track.scrollLeft = from + distance * easeOutCubic(progress)
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step)
        } else {
          animationRef.current = 0
          track.style.scrollSnapType = ''
        }
      }
      // snapping is disabled while we animate so the easing isn't fought
      track.style.scrollSnapType = 'none'
      animationRef.current = requestAnimationFrame(step)
    },
    [stopAnimation],
  )

  const goTo = useCallback(
    (index: number, instant = false) => {
      const track = trackRef.current
      const clamped = Math.max(0, Math.min(count - 1, index))
      setActiveIndex(clamped)
      if (!track) return

      if (instant) {
        stopAnimation()
        track.style.scrollSnapType = ''
        track.scrollLeft = clamped * track.clientWidth
        return
      }
      animateTo(clamped)
    },
    [animateTo, count, stopAnimation],
  )

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0

    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!track.clientWidth) return
        const index = Math.round(track.scrollLeft / track.clientWidth)
        setActiveIndex(Math.max(0, Math.min(count - 1, index)))
      })
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', handleScroll)
    }
  }, [count])

  useEffect(
    () => () => {
      cancelAnimationFrame(animationRef.current)
      cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // touch / pen keep native scroll-snap swiping
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const track = trackRef.current
    if (!track || count < 2) return

    stopAnimation()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      startScroll: track.scrollLeft,
      moved: false,
    }
    track.style.scrollSnapType = 'none'
    track.style.scrollBehavior = 'auto'
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    const track = trackRef.current
    if (!state || !track) return

    const delta = event.clientX - state.startX

    if (!state.moved) {
      if (Math.abs(delta) <= DRAG_THRESHOLD) return
      state.moved = true
      try {
        track.setPointerCapture(state.pointerId)
      } catch {
        /* capture is best effort */
      }
    }

    const elapsed = event.timeStamp - state.lastTime
    if (elapsed > 0) {
      const instant = (event.clientX - state.lastX) / elapsed
      // light smoothing keeps the velocity reading steady
      state.velocity = state.velocity * 0.7 + instant * 0.3
    }
    state.lastX = event.clientX
    state.lastTime = event.timeStamp

    event.preventDefault()
    // one scroll write per frame — the image tracks the cursor smoothly
    pendingScrollRef.current = state.startScroll - delta
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const value = pendingScrollRef.current
        if (value !== null && trackRef.current) {
          trackRef.current.scrollLeft = value
        }
      })
    }
  }

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    const track = trackRef.current
    dragRef.current = null
    if (!state || !track) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    pendingScrollRef.current = null

    if (track.hasPointerCapture?.(state.pointerId)) {
      track.releasePointerCapture(state.pointerId)
    }
    track.style.scrollBehavior = ''

    if (!state.moved) {
      track.style.scrollSnapType = ''
      return
    }

    // a real drag happened — don't let it turn into a link click
    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 250)

    const width = track.clientWidth
    if (!width) {
      track.style.scrollSnapType = ''
      return
    }

    const dragged = event.clientX - state.startX
    const from = Math.round(state.startScroll / width)
    const direction = dragged < 0 ? 1 : -1
    const slight =
      Math.abs(dragged) > width * SLIGHT_SWIPE_RATIO ||
      Math.abs(state.velocity) > FLICK_VELOCITY

    const target = slight
      ? from + direction * Math.max(1, Math.round(Math.abs(dragged) / width))
      : Math.round(track.scrollLeft / width)

    goTo(target)
  }

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return {
    trackRef,
    activeIndex,
    goTo,
    next,
    prev,
    trackDragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClickCapture: handleClickCapture,
      onDragStart: (event) => event.preventDefault(),
    },
  }
}
