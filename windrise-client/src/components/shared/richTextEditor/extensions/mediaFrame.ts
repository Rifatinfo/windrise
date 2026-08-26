/**
 * The geometry every resizable media block shares: size, rotation, column
 * alignment, and — when the author breaks it out of the text flow — a free
 * position anywhere in the document.
 *
 * All of it serializes into the element's inline `style` plus two data
 * attributes, so the published page needs nothing but the shared stylesheet
 * to render it identically to the editor.
 */

export const ALIGN_VALUES = ["left", "center", "right"] as const
export type MediaAlign = (typeof ALIGN_VALUES)[number]

export interface MediaFrameAttrs {
  /** Percentage of the content width, e.g. "42.5%". */
  width: string | null
  /** Pixels; only set once an edge handle has stretched the block. */
  height: string | null
  align: MediaAlign | null
  /** Degrees clockwise. */
  rotate: number | null
  /** True once the block is positioned by hand rather than by the text flow. */
  free: boolean
  /** Left offset as a percentage of content width; only used when `free`. */
  x: string | null
  /** Top offset in pixels; only used when `free`. */
  y: string | null
}

export const EMPTY_FRAME: MediaFrameAttrs = {
  width: null,
  height: null,
  align: null,
  rotate: null,
  free: false,
  x: null,
  y: null,
}

/** Reads the geometry back off a rendered element. */
export function parseMediaFrame(element: HTMLElement): MediaFrameAttrs {
  const rotate = /rotate\(\s*(-?[\d.]+)deg\s*\)/.exec(element.style.transform ?? "")

  return {
    width: element.style.width || null,
    height: element.style.height || null,
    align: (element.getAttribute("data-align") as MediaAlign) || null,
    rotate: rotate ? Number(rotate[1]) : null,
    free: element.getAttribute("data-free") === "true",
    x: element.style.left || null,
    y: element.style.top || null,
  }
}

/** Tiptap attribute specs, spread into a node's `addAttributes`. */
export const MEDIA_FRAME_ATTRS = {
  width: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).width,
    renderHTML: () => ({}),
  },
  height: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).height,
    renderHTML: () => ({}),
  },
  align: {
    default: null as MediaAlign | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).align,
    renderHTML: () => ({}),
  },
  rotate: {
    default: null as number | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).rotate,
    renderHTML: () => ({}),
  },
  free: {
    default: false,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).free,
    renderHTML: () => ({}),
  },
  x: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).x,
    renderHTML: () => ({}),
  },
  y: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => parseMediaFrame(element).y,
    renderHTML: () => ({}),
  },
}

/** Node attrs are loosely typed, so accept anything frame-shaped. */
type FrameLike = Partial<MediaFrameAttrs>

/** The inline style string for a frame, or undefined when nothing is set. */
export function mediaFrameStyle(attrs: FrameLike): string | undefined {
  const parts: string[] = []

  if (attrs.width) parts.push(`width: ${attrs.width}`)
  if (attrs.height) parts.push(`height: ${attrs.height}`)
  if (attrs.rotate) parts.push(`transform: rotate(${attrs.rotate}deg)`)

  // Free blocks are taken out of the flow; the stylesheet supplies
  // `position: absolute` so the offsets below have something to bite on.
  if (attrs.free) {
    if (attrs.x) parts.push(`left: ${attrs.x}`)
    if (attrs.y) parts.push(`top: ${attrs.y}`)
  }

  return parts.length ? parts.join("; ") : undefined
}

/**
 * True once a handle has given the block an explicit size.
 *
 * The stylesheet needs this as an attribute it can select on: an unsized
 * frame shrink-wraps its media, and a child stretched to `width: 100%` would
 * defeat that shrink-wrap, so the media only fills the frame once the frame
 * has a size of its own.
 */
export const isSized = (attrs: FrameLike) => Boolean(attrs.width || attrs.height)

/** Style plus data attributes, ready to spread into `renderHTML`. */
export function mediaFrameHTMLAttrs(attrs: FrameLike): Record<string, string> {
  const style = mediaFrameStyle(attrs)

  return {
    ...(style ? { style } : {}),
    ...(attrs.align ? { "data-align": String(attrs.align) } : {}),
    ...(attrs.free ? { "data-free": "true" } : {}),
    ...(isSized(attrs) ? { "data-sized": "true" } : {}),
  }
}

/** The same geometry as React inline styles, for the node views. */
export function mediaFrameCss(attrs: FrameLike): React.CSSProperties {
  return {
    width: attrs.width ?? undefined,
    height: attrs.height ?? undefined,
    transform: attrs.rotate ? `rotate(${attrs.rotate}deg)` : undefined,
    left: attrs.free ? (attrs.x ?? undefined) : undefined,
    top: attrs.free ? (attrs.y ?? undefined) : undefined,
  }
}
