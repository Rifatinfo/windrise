"use client"

import * as React from "react"
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react"
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Move,
  RotateCcw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  CONTENT_BLOCKS,
  EmbedBlock,
  Figure,
  ImageBlock,
  VideoBlock,
} from "./blocks"
import {
  isSized,
  mediaFrameCss,
  type MediaAlign,
  type MediaFrameAttrs,
} from "./mediaFrame"

/**
 * The eight bounding-box handles. `dx`/`dy` say which edges the handle moves:
 * corners (both non-zero) scale proportionally, edges stretch one axis.
 */
const HANDLES = [
  { key: "nw", dx: -1, dy: -1, className: "-left-1.5 -top-1.5 cursor-nwse-resize" },
  { key: "n", dx: 0, dy: -1, className: "left-1/2 -top-1.5 -ml-1.5 cursor-ns-resize" },
  { key: "ne", dx: 1, dy: -1, className: "-right-1.5 -top-1.5 cursor-nesw-resize" },
  { key: "w", dx: -1, dy: 0, className: "-left-1.5 top-1/2 -mt-1.5 cursor-ew-resize" },
  { key: "e", dx: 1, dy: 0, className: "-right-1.5 top-1/2 -mt-1.5 cursor-ew-resize" },
  { key: "sw", dx: -1, dy: 1, className: "-left-1.5 -bottom-1.5 cursor-nesw-resize" },
  { key: "s", dx: 0, dy: 1, className: "left-1/2 -bottom-1.5 -ml-1.5 cursor-ns-resize" },
  { key: "se", dx: 1, dy: 1, className: "-right-1.5 -bottom-1.5 cursor-nwse-resize" },
] as const

const MIN_WIDTH_PX = 40
const MIN_HEIGHT_PX = 30
/** Pointer travel before a press on an image counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4

/** Rotate a pointer delta into the frame's own (rotated) coordinate space. */
function toLocalDelta(dx: number, dy: number, degrees: number) {
  const rad = (-degrees * Math.PI) / 180
  return {
    x: dx * Math.cos(rad) - dy * Math.sin(rad),
    y: dx * Math.sin(rad) + dy * Math.cos(rad),
  }
}

type Geometry = Partial<MediaFrameAttrs>

/**
 * Select, scale, rotate and freely position a media block.
 *
 * Geometry is written to the document only when a gesture ends, so a drag is
 * a single undo step; during the gesture a local override drives the preview.
 */
function useMediaFrame({
  editor,
  getPos,
  attrs,
  updateAttributes,
}: {
  editor: NodeViewProps["editor"]
  getPos: NodeViewProps["getPos"]
  attrs: MediaFrameAttrs
  updateAttributes: NodeViewProps["updateAttributes"]
}) {
  const frameRef = React.useRef<HTMLElement | null>(null)
  const [preview, setPreview] = React.useState<Geometry | null>(null)
  const [gesture, setGesture] = React.useState<"resize" | "rotate" | "move" | null>(null)

  const select = React.useCallback(() => {
    const pos = getPos()
    if (typeof pos === "number") editor.commands.setNodeSelection(pos)
  }, [editor, getPos])

  /** Runs a pointer gesture, previewing locally and committing on release. */
  const runGesture = (
    kind: "resize" | "rotate" | "move",
    event: React.PointerEvent,
    compute: (move: PointerEvent, context: GestureContext) => Geometry
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const frame = frameRef.current
    if (!frame) return

    const dom = editor.view.dom
    const box = frame.getBoundingClientRect()
    const editorBox = dom.getBoundingClientRect()

    const context: GestureContext = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: frame.offsetWidth,
      startHeight: frame.offsetHeight,
      centerX: box.left + box.width / 2,
      centerY: box.top + box.height / 2,
      contentWidth: dom.clientWidth,
      contentHeight: dom.scrollHeight,
      // Where the block sits inside the document right now, which is what a
      // move gesture offsets from. Rects are viewport-relative, so an editor
      // that scrolls internally has to have that scroll added back.
      startLeft: box.left - editorBox.left + dom.scrollLeft,
      startTop: box.top - editorBox.top + dom.scrollTop,
      rotation: attrs.rotate ?? 0,
    }

    let latest: Geometry = {}
    setGesture(kind)

    const onMove = (move: PointerEvent) => {
      latest = compute(move, context)
      setPreview(latest)
    }

    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      setPreview(null)
      setGesture(null)
      if (Object.keys(latest).length) updateAttributes(latest)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const startResize = (
    event: React.PointerEvent,
    handle: { dx: number; dy: number }
  ) =>
    runGesture("resize", event, (move, context) => {
      const local = toLocalDelta(
        move.clientX - context.startX,
        move.clientY - context.startY,
        context.rotation
      )

      const next: Geometry = {}

      if (handle.dx !== 0) {
        const width = Math.max(MIN_WIDTH_PX, context.startWidth + local.x * handle.dx)
        next.width = `${Math.round((width / context.contentWidth) * 1000) / 10}%`
      }

      if (handle.dy !== 0) {
        const height = Math.max(MIN_HEIGHT_PX, context.startHeight + local.y * handle.dy)
        next.height = `${Math.round(height)}px`
      }

      // A corner scales the whole box, so height follows the image's own
      // aspect ratio rather than being pinned.
      if (handle.dx !== 0 && handle.dy !== 0) next.height = null

      return next
    })

  const startRotate = (event: React.PointerEvent) =>
    runGesture("rotate", event, (move, context) => {
      const degrees =
        (Math.atan2(move.clientY - context.centerY, move.clientX - context.centerX) *
          180) /
          Math.PI +
        90

      // Free by default; Shift opts into 15° steps for a deliberate angle.
      const snapped = move.shiftKey ? Math.round(degrees / 15) * 15 : degrees
      return { rotate: Math.round(snapped) % 360 }
    })

  /**
   * Drag the block to any position in the document.
   *
   * A block still in the text flow is converted on the first real movement,
   * keeping the exact spot it already occupied — so dragging just works and
   * a plain click never rips an image out of the flow by accident.
   */
  const startMove = (event: React.PointerEvent) =>
    runGesture("move", event, (move, context) => {
      const dx = move.clientX - context.startX
      const dy = move.clientY - context.startY

      // Below the threshold this was a click, not a drag: commit nothing.
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return {}

      // The only constraint is the editor's own bounds — no grid, no guides,
      // no snapping. Clamping just keeps the block reachable, so it can never
      // be dragged off where it could not be selected again.
      const maxLeft = Math.max(0, context.contentWidth - context.startWidth)
      const maxTop = Math.max(0, context.contentHeight - context.startHeight)
      const left = Math.min(maxLeft, Math.max(0, context.startLeft + dx))
      const top = Math.min(maxTop, Math.max(0, context.startTop + dy))

      return {
        free: true,
        x: `${Math.round((left / context.contentWidth) * 1000) / 10}%`,
        y: `${Math.round(top)}px`,
      }
    })

  /**
   * Breaking a block out of the flow has to keep it where it already is,
   * otherwise it jumps to the top-left the moment free mode is switched on.
   */
  const toggleFree = () => {
    const frame = frameRef.current
    if (!frame) return

    if (attrs.free) {
      updateAttributes({ free: false, x: null, y: null })
      return
    }

    const dom = editor.view.dom
    const box = frame.getBoundingClientRect()
    const editorBox = dom.getBoundingClientRect()
    const contentWidth = dom.clientWidth
    const left = box.left - editorBox.left + dom.scrollLeft
    const top = box.top - editorBox.top + dom.scrollTop

    updateAttributes({
      free: true,
      x: `${Math.round((left / contentWidth) * 1000) / 10}%`,
      y: `${Math.round(top)}px`,
    })
  }

  return {
    frameRef,
    select,
    startResize,
    startRotate,
    startMove,
    toggleFree,
    gesture,
    /** Attributes with the in-flight gesture applied on top. */
    live: { ...attrs, ...preview } as MediaFrameAttrs,
  }
}

interface GestureContext {
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  centerX: number
  centerY: number
  contentWidth: number
  startLeft: number
  startTop: number
  contentHeight: number
  rotation: number
}

const ALIGN_BUTTONS = [
  { value: "left", label: "Align left", Icon: AlignLeft },
  { value: "center", label: "Align center", Icon: AlignCenter },
  { value: "right", label: "Align right", Icon: AlignRight },
] as const

/** Controls pinned over the selected block. */
function MediaToolbar({
  live,
  onAlign,
  onToggleFree,
  onReset,
}: {
  live: MediaFrameAttrs
  onAlign: (value: MediaAlign) => void
  onToggleFree: () => void
  onReset: () => void
}) {
  const button = (active: boolean) =>
    cn(
      "inline-flex size-6 items-center justify-center rounded transition-colors [&_svg]:size-3.5",
      active ? "bg-brand/10 text-brand" : "text-slate-500 hover:bg-slate-100"
    )

  return (
    <span contentEditable={false} className="rte-media-toolbar">
      {ALIGN_BUTTONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={live.free ? `${label} (inline mode only)` : label}
          aria-label={label}
          aria-pressed={live.align === value}
          disabled={live.free}
          // Never let a control steal the selection off the frame.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onAlign(value)}
          className={cn(button(live.align === value), live.free && "opacity-30")}
        >
          <Icon />
        </button>
      ))}

      {/* Orientation follows the toolbar, which flips to a row on narrow
          screens; the stylesheet owns both cases. */}
      <span className="rte-media-toolbar-divider" aria-hidden="true" />

      <button
        type="button"
        title={live.free ? "Return to the text flow" : "Place freely"}
        aria-label="Toggle free placement"
        aria-pressed={live.free}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggleFree}
        className={button(live.free)}
      >
        <Move />
      </button>

      <button
        type="button"
        title="Reset size, rotation and position"
        aria-label="Reset"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onReset}
        className={button(false)}
      >
        <RotateCcw />
      </button>
    </span>
  )
}

/** Bounding box: eight handles plus the rotation grip above the top edge. */
function Handles({
  live,
  gesture,
  onResize,
  onRotate,
}: {
  live: MediaFrameAttrs
  gesture: "resize" | "rotate" | "move" | null
  onResize: (event: React.PointerEvent, handle: { dx: number; dy: number }) => void
  onRotate: (event: React.PointerEvent) => void
}) {
  return (
    <>
      <span
        contentEditable={false}
        onPointerDown={onRotate}
        title="Rotate"
        className="absolute -top-8 left-1/2 z-20 flex size-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-brand bg-white text-brand shadow-sm active:cursor-grabbing [&_svg]:size-3"
      >
        <RotateCcw />
      </span>
      {/* Stem joining the grip to the box, as in a slide editor. */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-3 w-px -translate-x-1/2 bg-brand"
      />

      {HANDLES.map((handle) => (
        <span
          key={handle.key}
          contentEditable={false}
          onPointerDown={(event) => onResize(event, handle)}
          className={cn(
            "absolute z-20 size-3 rounded-full border-2 border-brand bg-white shadow-sm",
            handle.className
          )}
        />
      ))}

      {gesture === "resize" && (
        <span
          contentEditable={false}
          className="absolute -bottom-7 left-1/2 z-20 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
        >
          {live.width ?? "auto"}
          {live.height ? ` × ${live.height}` : ""}
        </span>
      )}

      {gesture === "rotate" && (
        <span
          contentEditable={false}
          className="absolute -bottom-7 left-1/2 z-20 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
        >
          {live.rotate ?? 0}°
        </span>
      )}
    </>
  )
}

type FrameShellProps = {
  as?: React.ElementType
  className?: string
  selected: boolean
  frameRef: React.Ref<HTMLElement>
  live: MediaFrameAttrs
  gesture: "resize" | "rotate" | "move" | null
  onStartResize: (event: React.PointerEvent, handle: { dx: number; dy: number }) => void
  onStartRotate: (event: React.PointerEvent) => void
  onStartMove: (event: React.PointerEvent) => void
  onToggleFree: () => void
  onReset: () => void
  onAlign: (value: MediaAlign) => void
  children: React.ReactNode
  caption?: React.ReactNode
}

function MediaFrame({
  as = "div",
  className,
  selected,
  frameRef,
  live,
  gesture,
  onStartResize,
  onStartRotate,
  onStartMove,
  onToggleFree,
  onReset,
  onAlign,
  children,
  caption,
}: FrameShellProps) {
  const active = selected || gesture !== null

  return (
    <NodeViewWrapper
      as={as}
      ref={frameRef}
      className={cn(
        "rte-media-frame",
        active && "is-selected",
        gesture && "is-busy",
        live.free && "is-free",
        className
      )}
      style={mediaFrameCss(live)}
      data-align={live.align ?? undefined}
      data-free={live.free ? "true" : undefined}
      data-sized={isSized(live) ? "true" : undefined}
    >
      {children}

      {/* In free mode the block is dragged by its body, so the whole frame
          becomes the move handle once it is selected. */}
      {selected && live.free && (
        <span
          contentEditable={false}
          onPointerDown={onStartMove}
          className="absolute inset-0 z-10 cursor-move"
        />
      )}

      {active && (
        <Handles
          live={live}
          gesture={gesture}
          onResize={onStartResize}
          onRotate={onStartRotate}
        />
      )}

      {selected && !gesture && (
        <MediaToolbar
          live={live}
          onAlign={onAlign}
          onToggleFree={onToggleFree}
          onReset={onReset}
        />
      )}

      {caption}
    </NodeViewWrapper>
  )
}

/** Shared wiring every media node view needs. */
function useMediaNode(props: NodeViewProps) {
  const attrs = props.node.attrs as unknown as MediaFrameAttrs

  const {
    frameRef,
    select,
    startResize,
    startRotate,
    startMove,
    toggleFree,
    gesture,
    live,
  } = useMediaFrame({
    editor: props.editor,
    getPos: props.getPos,
    attrs,
    updateAttributes: props.updateAttributes,
  })

  /**
   * Pressing an image selects it and arms a drag in one gesture, so the image
   * can be dragged straight to a new position without any mode to switch on.
   */
  const onPressBody = (event: React.PointerEvent) => {
    select()
    startMove(event)
  }

  const frameProps = {
    frameRef: frameRef as React.Ref<HTMLElement>,
    live,
    gesture,
    onStartResize: startResize,
    onStartRotate: startRotate,
    onStartMove: startMove,
    onToggleFree: toggleFree,
    onAlign: (value: MediaAlign) => props.updateAttributes({ align: value }),
    onReset: () =>
      props.updateAttributes({
        width: null,
        height: null,
        rotate: null,
        align: null,
        free: false,
        x: null,
        y: null,
      }),
  }

  return { frameProps, select, onPressBody }
}

/** Bare `<img>` — no caption. */
function ImageBlockView(props: NodeViewProps) {
  const { node, selected } = props
  const { frameProps, onPressBody } = useMediaNode(props)

  return (
    <MediaFrame selected={selected} {...frameProps}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={node.attrs.src ?? ""}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? undefined}
        draggable={false}
        // Pressing the image both selects it and arms a drag; the gesture
        // only commits once the pointer actually travels.
        onPointerDown={onPressBody}
      />
    </MediaFrame>
  )
}

/** `<figure>` with an editable caption. */
function FigureView(props: NodeViewProps) {
  const { node, selected } = props
  const { frameProps, onPressBody } = useMediaNode(props)

  return (
    <MediaFrame
      as="figure"
      className="post-figure"
      selected={selected}
      {...frameProps}
      caption={
        // The generic is explicit because `as` is wrapped in NoInfer.
        <NodeViewContent<"figcaption"> as="figcaption" data-placeholder="Add a caption…" />
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={node.attrs.src ?? ""}
        alt={node.attrs.alt ?? ""}
        draggable={false}
        // Pressing the image both selects it and arms a drag; the gesture
        // only commits once the pointer actually travels.
        onPointerDown={onPressBody}
      />
    </MediaFrame>
  )
}

/** `<video controls>` — selectable without losing the playback controls. */
function VideoBlockView(props: NodeViewProps) {
  const { node, selected } = props
  const { frameProps, select } = useMediaNode(props)

  return (
    <MediaFrame selected={selected} {...frameProps}>
      <video
        className="video-block"
        src={node.attrs.src ?? ""}
        controls
        // No preventDefault: the browser's own controls must keep the click.
        onMouseDown={select}
      />
    </MediaFrame>
  )
}

/**
 * Embedded player. Pointer events go into the iframe, so an overlay catches
 * the first click; once selected it stops intercepting and the video plays.
 */
function EmbedBlockView(props: NodeViewProps) {
  const { node, selected } = props
  const { frameProps, select } = useMediaNode(props)

  return (
    <MediaFrame
      className="embed-wrap"
      selected={selected}
      {...frameProps}
    >
      <iframe
        src={node.attrs.src ?? ""}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      {!selected && (
        <span
          contentEditable={false}
          onMouseDown={(event) => {
            event.preventDefault()
            select()
          }}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}
    </MediaFrame>
  )
}

export const ResizableImageBlock = ImageBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView)
  },
})

export const ResizableFigure = Figure.extend({
  addNodeView() {
    return ReactNodeViewRenderer(FigureView)
  },

  /**
   * A figure holds an editable caption, so it is not an atom — ProseMirror's
   * default click handling puts a caret in the caption instead of selecting
   * the node, and the bounding box would never appear. `handleClickOn` is the
   * supported hook for overriding that; returning true stops ProseMirror
   * applying its own selection afterwards.
   */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("figureClickSelect"),
        props: {
          handleClickOn(view, _pos, node, nodePos, event, direct) {
            if (!direct || node.type.name !== "figure") return false

            // Clicking the caption should still just place the caret there.
            const target = event.target as HTMLElement | null
            if (target?.closest("figcaption")) return false

            view.dispatch(
              view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos))
            )
            return true
          },
        },
      }),
    ]
  },
})

export const ResizableVideoBlock = VideoBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockView)
  },
})

export const ResizableEmbedBlock = EmbedBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EmbedBlockView)
  },
})

const RESIZABLE = [
  ResizableImageBlock,
  ResizableFigure,
  ResizableVideoBlock,
  ResizableEmbedBlock,
]

const RESIZABLE_NAMES = new Set(RESIZABLE.map((extension) => extension.name))

/**
 * Every content block the post editor registers. The resizable variants
 * replace their plain counterparts from `CONTENT_BLOCKS`.
 */
export const POST_BLOCKS = [
  ...RESIZABLE,
  ...CONTENT_BLOCKS.filter((extension) => !RESIZABLE_NAMES.has(extension.name)),
]
