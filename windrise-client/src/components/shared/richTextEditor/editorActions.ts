import type { Editor } from "@tiptap/react"

/** Every dialog the editor can open. */
export type ModalKind =
  | "link"
  | "image"
  | "gallery"
  | "video"
  | "audio"
  | "file"
  | "embed"
  | "youtube"
  | "cta"
  | "callout"
  | "anchor"
  | "table"
  | "schedule"

export interface FieldSpec {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "datetime-local"
  placeholder?: string
  required?: boolean
  defaultValue?: string
  min?: number
  max?: number
  hint?: string
}

/**
 * Lets a dialog take a file straight from the machine instead of a URL.
 * The upload runs first, then its result is written into `target`, so the
 * URL field stays exactly as it was for anyone pasting a link.
 */
export interface UploadSpec {
  label: string
  /** `accept` for the file input. */
  accept: string
  /** Field that receives the uploaded URL. */
  target: string
  /** Field that receives the original filename, when the dialog has one. */
  nameTarget?: string
  /** Appends one URL per line rather than replacing (the gallery). */
  multiple?: boolean
}

export interface ModalSpec {
  title: string
  submitLabel: string
  fields: FieldSpec[]
  upload?: UploadSpec
}

/**
 * Dialog definitions. `link` grows a "Link text" field when nothing is
 * selected, which is why this is a function rather than a static map.
 */
export function modalSpec(kind: ModalKind, hasSelection: boolean): ModalSpec {
  switch (kind) {
    case "link":
      return {
        title: "Insert link",
        submitLabel: "Insert",
        fields: [
          {
            name: "href",
            label: "URL",
            type: "text",
            placeholder: "https://example.com",
            required: true,
          },
          ...(hasSelection
            ? []
            : [
                {
                  name: "text",
                  label: "Link text",
                  type: "text" as const,
                  placeholder: "Read the announcement",
                  required: true,
                },
              ]),
        ],
      }
    case "image":
      return {
        title: "Insert image",
        submitLabel: "Insert",
        upload: { label: "Upload an image", accept: "image/*", target: "src" },
        fields: [
          {
            name: "src",
            label: "Image URL",
            type: "text",
            placeholder: "https://…/photo.jpg",
            required: true,
          },
          { name: "alt", label: "Alt text", type: "text", placeholder: "Describe the image" },
          { name: "caption", label: "Caption", type: "text", placeholder: "Optional caption" },
        ],
      }
    case "gallery":
      return {
        title: "Insert gallery",
        submitLabel: "Insert gallery",
        upload: {
          label: "Upload images",
          accept: "image/*",
          target: "images",
          multiple: true,
        },
        fields: [
          {
            name: "images",
            label: "Image URLs",
            type: "textarea",
            placeholder: "https://…/one.jpg\nhttps://…/two.jpg",
            required: true,
            hint: "One URL per line — they lay out in a three-column grid.",
          },
        ],
      }
    case "video":
      return {
        title: "Insert video",
        submitLabel: "Insert",
        upload: { label: "Upload a video", accept: "video/*", target: "src" },
        fields: [
          {
            name: "src",
            label: "Video file URL",
            type: "text",
            placeholder: "https://…/clip.mp4",
            required: true,
          },
        ],
      }
    case "audio":
      return {
        title: "Insert audio",
        submitLabel: "Insert",
        upload: { label: "Upload audio", accept: "audio/*", target: "src" },
        fields: [
          {
            name: "src",
            label: "Audio file URL",
            type: "text",
            placeholder: "https://…/track.mp3",
            required: true,
          },
        ],
      }
    case "file":
      return {
        title: "Attach file",
        submitLabel: "Attach",
        upload: {
          label: "Upload a file",
          accept: "*/*",
          target: "href",
          nameTarget: "name",
        },
        fields: [
          {
            name: "href",
            label: "File URL",
            type: "text",
            placeholder: "https://…/report.pdf",
            required: true,
          },
          { name: "name", label: "File name", type: "text", placeholder: "Annual report.pdf" },
        ],
      }
    case "embed":
      return {
        title: "Embed video or link",
        submitLabel: "Embed",
        fields: [
          {
            name: "src",
            label: "Video URL (YouTube / Vimeo)",
            type: "text",
            placeholder: "https://www.youtube.com/watch?v=…",
            required: true,
          },
        ],
      }
    case "youtube":
      return {
        title: "Embed YouTube video",
        submitLabel: "Embed",
        fields: [
          {
            name: "src",
            label: "YouTube URL",
            type: "text",
            placeholder: "https://www.youtube.com/watch?v=…",
            required: true,
          },
        ],
      }
    case "cta":
      return {
        title: "Insert button",
        submitLabel: "Insert button",
        fields: [
          {
            name: "text",
            label: "Button text",
            type: "text",
            placeholder: "Get started",
            required: true,
          },
          {
            name: "href",
            label: "Button link",
            type: "text",
            placeholder: "https://example.com",
            required: true,
          },
        ],
      }
    case "callout":
      return {
        title: "Insert callout",
        submitLabel: "Insert callout",
        fields: [
          {
            name: "text",
            label: "Callout text",
            type: "textarea",
            placeholder: "Worth knowing before you start…",
            required: true,
          },
        ],
      }
    case "anchor":
      return {
        title: "Insert anchor link",
        submitLabel: "Insert",
        fields: [
          {
            name: "id",
            label: "Anchor ID",
            type: "text",
            placeholder: "pricing",
            required: true,
          },
          {
            name: "text",
            label: "Visible text",
            type: "text",
            placeholder: "Jump to pricing",
            required: true,
          },
        ],
      }
    case "table":
      return {
        title: "Insert table",
        submitLabel: "Insert table",
        fields: [
          { name: "rows", label: "Rows", type: "number", defaultValue: "3", min: 1, max: 20 },
          { name: "cols", label: "Columns", type: "number", defaultValue: "3", min: 1, max: 10 },
        ],
      }
    case "schedule":
      return {
        title: "Schedule for later",
        submitLabel: "Schedule",
        fields: [
          {
            name: "publishAt",
            label: "Publish at",
            type: "datetime-local",
            required: true,
            hint: "The post stays a draft until this moment.",
          },
        ],
      }
  }
}

/**
 * Apply inline text styling the way a word processor does.
 *
 * `setMark` on a collapsed cursor only sets a *stored mark*, which does
 * nothing until the next character is typed — that is why picking a font or
 * size with no selection looked broken. When nothing is selected we widen to
 * the whole block, style it, then put the caret back where it was.
 */
export function applyInlineStyle(
  editor: Editor,
  attributes: Record<string, string | null>
): void {
  const { selection } = editor.state
  const chain = editor.chain().focus()

  if (selection.empty) {
    const $from = selection.$from
    const from = $from.start()
    const to = $from.end()

    // An empty block has nothing to mark; fall back to a stored mark so the
    // choice still applies to whatever gets typed next.
    if (to > from) {
      chain
        .setTextSelection({ from, to })
        .setMark("textStyle", attributes)
        .setTextSelection(selection.from)
        .run()
      return
    }
  }

  chain.setMark("textStyle", attributes).run()
}

/**
 * Blocks that carry their own width, so they are positioned as a block
 * rather than by `text-align` on the surrounding paragraph.
 */
export const ALIGNABLE_MEDIA = ["figure", "imageBlock", "videoBlock", "embedBlock"]

/** The media node the caret or node-selection currently sits on, if any. */
export function activeMediaType(editor: Editor): string | null {
  return ALIGNABLE_MEDIA.find((name) => editor.isActive(name)) ?? null
}

/** Whichever alignment is currently in force — media takes precedence. */
export function activeAlignment(editor: Editor): string | null {
  const media = activeMediaType(editor)
  if (media) return (editor.getAttributes(media).align as string) ?? "left"

  return (
    (["left", "center", "right", "justify"] as const).find((value) =>
      editor.isActive({ textAlign: value })
    ) ?? null
  )
}

/**
 * One entry point for the four align buttons.
 *
 * With an image, video or embed selected they reposition that block;
 * otherwise they fall through to normal paragraph alignment. `justify` has
 * no block equivalent, so on media it means "stretch back to full width".
 */
export function applyAlignment(
  editor: Editor,
  align: "left" | "center" | "right" | "justify"
): void {
  const media = activeMediaType(editor)

  if (media) {
    editor
      .chain()
      .focus()
      .updateAttributes(
        media,
        align === "justify" ? { align: null, width: null } : { align }
      )
      .run()
    return
  }

  editor.chain().focus().setTextAlign(align).run()
}

/** Prefix a bare host with https:// so `example.com` still links. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

/**
 * Turn a watch/share URL into something an iframe will actually load.
 * Anything we do not recognise is embedded as-is.
 */
export function toEmbedSrc(rawUrl: string): string {
  const url = normalizeUrl(rawUrl)

  const youtube =
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/[?&]v=([\w-]{6,})/) ??
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}

const paragraph = (text: string) => ({
  type: "paragraph",
  content: text ? [{ type: "text", text }] : [],
})

/** Apply the result of a dialog to the document. */
export function applyModal(
  editor: Editor,
  kind: ModalKind,
  values: Record<string, string>
): void {
  const chain = editor.chain().focus()

  switch (kind) {
    case "link": {
      const href = normalizeUrl(values.href)
      if (!href) return
      if (values.text) {
        chain
          .insertContent({
            type: "text",
            text: values.text,
            marks: [{ type: "link", attrs: { href, target: "_blank", rel: "noopener noreferrer" } }],
          })
          .run()
        return
      }
      chain
        .extendMarkRange("link")
        .setLink({ href, target: "_blank", rel: "noopener noreferrer" })
        .run()
      return
    }

    case "image": {
      const src = values.src?.trim()
      if (!src) return
      chain
        .insertContent({
          type: "figure",
          attrs: { src, alt: values.alt?.trim() || null },
          content: values.caption?.trim()
            ? [{ type: "text", text: values.caption.trim() }]
            : [],
        })
        .run()
      return
    }

    case "gallery": {
      const images = (values.images ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
      if (!images.length) return
      chain.insertContent({ type: "gallery", attrs: { images } }).run()
      return
    }

    case "video":
    case "audio": {
      const src = values.src?.trim()
      if (!src) return
      chain
        .insertContent({ type: kind === "video" ? "videoBlock" : "audioBlock", attrs: { src } })
        .run()
      return
    }

    case "file": {
      const href = normalizeUrl(values.href)
      if (!href) return
      chain
        .insertContent({
          type: "fileBlock",
          attrs: { href, name: values.name?.trim() || href.split("/").pop() || "Attachment" },
        })
        .run()
      return
    }

    case "embed":
    case "youtube": {
      const src = toEmbedSrc(values.src ?? "")
      if (!src) return
      chain.insertContent({ type: "embedBlock", attrs: { src } }).run()
      return
    }

    case "cta": {
      const href = normalizeUrl(values.href)
      const text = values.text?.trim()
      if (!href || !text) return
      chain.insertContent({ type: "ctaButton", attrs: { href, text } }).run()
      return
    }

    case "callout": {
      const text = values.text?.trim()
      if (!text) return
      chain
        .insertContent({
          type: "callout",
          content: text.split(/\r?\n/).map((line) => paragraph(line)),
        })
        .run()
      return
    }

    case "anchor": {
      const id = values.id?.trim().replace(/\s+/g, "-").toLowerCase()
      const text = values.text?.trim()
      if (!id || !text) return
      chain
        .insertContent({
          type: "text",
          text,
          marks: [{ type: "link", attrs: { href: `#${id}`, id, target: null, rel: null } }],
        })
        .run()
      return
    }

    case "table": {
      const rows = Math.max(1, Math.min(20, Number(values.rows) || 3))
      const cols = Math.max(1, Math.min(10, Number(values.cols) || 3))
      chain.insertTable({ rows, cols, withHeaderRow: true }).run()
      return
    }

    case "schedule":
      // Handled by the host component — nothing to write into the document.
      return
  }
}

/** Blocks that need no dialog, shared by the toolbar, cheatsheet and `/` menu. */
export type QuickAction =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "bulletList"
  | "orderedList"
  | "divider"
  | "codeBlock"
  | "inlineCode"
  | "highlight"
  | "spacer"
  | "readMore"
  | "pageBreak"
  | "accordion"
  | "footnote"
  | "clearFormatting"

export function runQuickAction(editor: Editor, action: QuickAction): void {
  const chain = editor.chain().focus()

  switch (action) {
    case "paragraph":
      chain.setParagraph().run()
      return
    case "h1":
      chain.setHeading({ level: 1 }).run()
      return
    case "h2":
      chain.setHeading({ level: 2 }).run()
      return
    case "h3":
      chain.setHeading({ level: 3 }).run()
      return
    case "quote":
      chain.toggleBlockquote().run()
      return
    case "bulletList":
      chain.toggleBulletList().run()
      return
    case "orderedList":
      chain.toggleOrderedList().run()
      return
    case "divider":
      chain.setHorizontalRule().run()
      return
    case "codeBlock":
      chain.toggleCodeBlock().run()
      return
    case "inlineCode":
      chain.toggleCode().run()
      return
    case "highlight":
      chain.toggleHighlight({ color: "#fef08a" }).run()
      return
    case "spacer":
      chain.insertContent({ type: "spacer" }).run()
      return
    case "readMore":
      chain.insertContent({ type: "readMore" }).run()
      return
    case "pageBreak":
      chain.insertContent({ type: "pageBreak" }).run()
      return
    case "accordion":
      chain
        .insertContent({
          type: "accordion",
          attrs: { summary: "Details" },
          content: [paragraph("Hidden until the reader expands this.")],
        })
        .run()
      return
    case "footnote":
      chain
        .insertContent({ type: "text", text: "1", marks: [{ type: "superscript" }] })
        .unsetMark("superscript")
        .run()
      return
    case "clearFormatting":
      chain.clearNodes().unsetAllMarks().unsetBlockSpacing().run()
      return
  }
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

/**
 * Build a linked table of contents from the headings already in the post,
 * stamping each heading with an id so the links have somewhere to land.
 *
 * Returns false when there are no headings yet, so the caller can explain why
 * nothing happened.
 */
export function insertTableOfContents(editor: Editor): boolean {
  const { state } = editor
  const transaction = state.tr
  const entries: { text: string; id: string }[] = []
  const used = new Set<string>()

  state.doc.descendants((node, pos) => {
    if (node.type.name !== "heading") return
    const text = node.textContent.trim()
    if (!text) return

    let id = slugify(text) || `section-${entries.length + 1}`
    while (used.has(id)) id = `${id}-${used.size + 1}`
    used.add(id)

    // Attribute-only updates leave positions untouched, so collecting and
    // stamping in the same pass is safe.
    transaction.setNodeAttribute(pos, "id", id)
    entries.push({ text, id })
  })

  if (!entries.length) return false

  editor.view.dispatch(transaction)
  editor
    .chain()
    .focus()
    .insertContent({
      type: "bulletList",
      content: entries.map((entry) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: entry.text,
                marks: [{ type: "link", attrs: { href: `#${entry.id}` } }],
              },
            ],
          },
        ],
      })),
    })
    .run()

  return true
}

/** Insert a literal string (emoji, symbol, em dash) at the caret. */
export function insertText(editor: Editor, text: string): void {
  editor.chain().focus().insertContent(text).run()
}
