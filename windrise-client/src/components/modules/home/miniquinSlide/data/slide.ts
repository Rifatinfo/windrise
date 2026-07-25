import type { Transition } from 'framer-motion'

export const SPRING: Transition = {
  type: 'spring',
  stiffness: 90,
  damping: 20,
  mass: 0.9,
}

export function ringOffset(index: number, active: number, total: number): number {
  let difference = index - active
  const half = total / 2
  if (difference > half) difference -= total
  if (difference < -half) difference += total
  return difference
}

export function wrapIndex(index: number, total: number): number {
  return ((index % total) + total) % total
}

/**
 * Five fixed campaign slots on the 1699 × 1183 composition.
 * Centre is the first (tall) line; ±1 are the elevated rear line;
 * ±2 are the two outer figures on the front line.
 *
 * On mobile, the same five-look campaign arrangement is retained. Its
 * positions are viewport-relative so each complete cutout remains visible
 * within a narrow screen rather than being clipped at the left and right.
 */
export function cardStyle(distance: number, canvasScale: number, isMobile = false) {
  if (isMobile) {
    const mobileSlots: Record<number, { x: string; y: number; scale: number; zIndex: number }> = {
      '-2': { x: '-30vw', y: -10, scale: 0.48, zIndex: 50 },
      '-1': { x: '-15vw', y: -42, scale: 0.39, zIndex: 60 },
      '0': { x: '0vw', y: 12, scale: 0.78, zIndex: 100 },
      '1': { x: '15vw', y: -42, scale: 0.39, zIndex: 60 },
      '2': { x: '30vw', y: -10, scale: 0.48, zIndex: 50 },
    }
    const slot = mobileSlots[distance] ?? mobileSlots[distance < 0 ? -2 : 2]

    return {
      x: slot.x,
      y: slot.y,
      scale: slot.scale,
      zIndex: slot.zIndex,
    }
  }

  const slots: Record<number, { x: number; y: number; scale: number; zIndex: number }> = {
    // Outer side looks are deliberately larger than the elevated middle pair.
    '-2': { x: -318, y: -32, scale: 0.72, zIndex: 50 },
    '-1': { x: -172, y: -108, scale: 0.58, zIndex: 60 },
    '0': { x: 0, y: 70, scale: 1, zIndex: 100 },
    '1': { x: 172, y: -108, scale: 0.58, zIndex: 60 },
    '2': { x: 318, y: -32, scale: 0.72, zIndex: 50 },
  }

  const slot = slots[distance] ?? slots[distance < 0 ? -2 : 2]
  const isActive = distance === 0

  return {
    x: slot.x * canvasScale,
    y: slot.y * canvasScale,
    scale: slot.scale,
    opacity: isActive ? 1 : distance === -1 || distance === 1 ? 0.82 : 0.76,
    // Every cutout stays crisp; depth is communicated by size and layering alone.
    blur: 0,
    zIndex: slot.zIndex,
  }
}
