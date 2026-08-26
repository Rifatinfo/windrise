import { Node, mergeAttributes } from "@tiptap/core"

import {
  MEDIA_FRAME_ATTRS,
  mediaFrameHTMLAttrs,
  parseMediaFrame,
} from "./mediaFrame"

export { ALIGN_VALUES, type MediaAlign } from "./mediaFrame"

/**
 * Rich content blocks for the blog editor.
 *
 * Every node renders to plain, self-describing HTML (no data-* payloads
 * beyond what is needed to round-trip) so the stored string stays readable,
 * survives the sanitizer, and renders identically on the public post page
 * with nothing but the shared `.rte-content / .post-content` stylesheet.
 */

const passthroughAttr = (name: string, fallback: string | null = null) => ({
  default: fallback,
  parseHTML: (element: HTMLElement) => element.getAttribute(name),
  renderHTML: (attributes: Record<string, unknown>) =>
    attributes[name] ? { [name]: attributes[name] } : {},
})

/** A bare image, so legacy/pasted `<img>` survives a round-trip. */
export const ImageBlock = Node.create({
  name: "imageBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: passthroughAttr("src"),
      alt: passthroughAttr("alt"),
      title: passthroughAttr("title"),
      ...MEDIA_FRAME_ATTRS,
    }
  },

  parseHTML() {
    // Images inside a figure belong to the figure node, not to this one.
    return [{ tag: "img[src]:not(figure img)" }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, mediaFrameHTMLAttrs(node.attrs))]
  },
})

/** Image plus an optional, still-editable caption. */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: passthroughAttr("src"),
      alt: passthroughAttr("alt"),
      /**
       * Geometry lives on the `<figure>` rather than the `<img>`, so the
       * caption tracks the image instead of the whole column.
       */
      ...MEDIA_FRAME_ATTRS,
    }
  },

  parseHTML() {
    return [
      {
        tag: "figure.post-figure",
        contentElement: "figcaption",
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img")
          return {
            src: img?.getAttribute("src") ?? null,
            alt: img?.getAttribute("alt") ?? null,
            ...parseMediaFrame(element as HTMLElement),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      { class: "post-figure", ...mediaFrameHTMLAttrs(node.attrs) },
      ["img", mergeAttributes(HTMLAttributes)],
      ["figcaption", {}, 0],
    ]
  },
})

/** Fixed three-column image grid. */
export const Gallery = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      images: {
        default: [] as string[],
        parseHTML: (element: HTMLElement) =>
          Array.from(element.querySelectorAll("img"))
            .map((img) => img.getAttribute("src") ?? "")
            .filter(Boolean),
        // Sources ride on the rendered <img> children, not on an attribute.
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div.gallery-grid" }]
  },

  renderHTML({ node }) {
    const images: string[] = Array.isArray(node.attrs.images) ? node.attrs.images : []
    return [
      "div",
      { class: "gallery-grid" },
      ...images.map((src) => ["img", { src, alt: "", loading: "lazy" }]),
    ] as never
  },
})

/** Self-hosted media — `<video controls>` / `<audio controls>`. */
const mediaBlock = (name: string, tag: "video" | "audio", resizable = false) =>
  Node.create({
    name,
    group: "block",
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
      return {
        src: passthroughAttr("src"),
        ...(resizable ? MEDIA_FRAME_ATTRS : {}),
      }
    },

    parseHTML() {
      return [{ tag: `${tag}[src]` }]
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        tag,
        mergeAttributes(HTMLAttributes, {
          controls: "true",
          class: `${tag}-block`,
          ...(resizable ? mediaFrameHTMLAttrs(node.attrs) : {}),
        }),
      ]
    },
  })

export const VideoBlock = mediaBlock("videoBlock", "video", true)
export const AudioBlock = mediaBlock("audioBlock", "audio")

/** Downloadable attachment row. */
export const FileBlock = Node.create({
  name: "fileBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      href: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("a")?.getAttribute("href") ?? null,
        renderHTML: () => ({}),
      },
      name: {
        default: "Attachment",
        parseHTML: (element: HTMLElement) =>
          element.querySelector("a")?.textContent?.trim() || "Attachment",
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div.file-block" }]
  },

  renderHTML({ node }) {
    return [
      "div",
      { class: "file-block" },
      ["span", { class: "file-block-icon", "aria-hidden": "true" }],
      [
        "a",
        {
          href: node.attrs.href ?? "#",
          target: "_blank",
          rel: "noopener noreferrer",
          download: "",
        },
        node.attrs.name ?? "Attachment",
      ],
    ]
  },
})

/** 16:9 responsive iframe — YouTube, Vimeo, or anything embeddable. */
export const EmbedBlock = Node.create({
  name: "embedBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("iframe")?.getAttribute("src") ?? null,
        renderHTML: () => ({}),
      },
      // Sits on the aspect-ratio wrapper, so scaling stays proportional.
      ...MEDIA_FRAME_ATTRS,
    }
  },

  parseHTML() {
    return [{ tag: "div.embed-wrap" }]
  },

  renderHTML({ node }) {
    return [
      "div",
      { class: "embed-wrap", ...mediaFrameHTMLAttrs(node.attrs) },
      [
        "iframe",
        {
          src: node.attrs.src ?? "",
          loading: "lazy",
          allowfullscreen: "true",
          allow:
            "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        },
      ],
    ]
  },
})

/** Call-to-action pill button. */
export const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      href: passthroughAttr("href", "#"),
      text: {
        default: "Learn more",
        parseHTML: (element: HTMLElement) => element.textContent?.trim() || "Learn more",
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "a.cta-btn" }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      { class: "cta-wrap" },
      [
        "a",
        mergeAttributes(HTMLAttributes, {
          class: "cta-btn",
          target: "_blank",
          rel: "noopener noreferrer",
        }),
        node.attrs.text ?? "Learn more",
      ],
    ]
  },
})

/** Accent-bordered note box; stays editable after insertion. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div.callout" }]
  },

  renderHTML() {
    return ["div", { class: "callout" }, 0]
  },
})

/** Collapsible `<details>` section. */
export const Accordion = Node.create({
  name: "accordion",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      summary: {
        default: "Details",
        parseHTML: (element: HTMLElement) =>
          element.querySelector("summary")?.textContent?.trim() || "Details",
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "details.accordion", contentElement: ".accordion-body" }]
  },

  renderHTML({ node }) {
    return [
      "details",
      { class: "accordion", open: "true" },
      ["summary", {}, node.attrs.summary ?? "Details"],
      ["div", { class: "accordion-body" }, 0],
    ]
  },
})

/** Fixed vertical breathing room. */
export const Spacer = Node.create({
  name: "spacer",
  group: "block",
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "div.spacer" }]
  },

  renderHTML() {
    return ["div", { class: "spacer", "aria-hidden": "true" }]
  },
})

/** The "everything below is after the fold" marker. */
export const ReadMore = Node.create({
  name: "readMore",
  group: "block",
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "div.read-more" }]
  },

  renderHTML() {
    return ["div", { class: "read-more" }, ["span", {}, "Read more"]]
  },
})

/** Print/pagination break — a dashed rule. */
export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "hr.page-break" }]
  },

  renderHTML() {
    return ["hr", { class: "page-break" }]
  },
})

/**
 * Every block node above. The post editor swaps the image, video and embed
 * entries for the resizable variants in `mediaViews.tsx`.
 */
export const CONTENT_BLOCKS = [
  ImageBlock,
  Figure,
  Gallery,
  VideoBlock,
  AudioBlock,
  FileBlock,
  EmbedBlock,
  CtaButton,
  Callout,
  Accordion,
  Spacer,
  ReadMore,
  PageBreak,
]
