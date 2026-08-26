import { Extension, Mark, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    superscript: {
      toggleSuperscript: () => ReturnType
    }
    subscript: {
      toggleSubscript: () => ReturnType
    }
    keyboardKey: {
      toggleKeyboardKey: () => ReturnType
    }
    inlineTypography: {
      /** Merge inline typography onto the current selection's textStyle mark. */
      setInlineTypography: (attributes: InlineTypographyAttributes) => ReturnType
      /** Drop every inline typography attribute (leaves colour/size alone). */
      unsetInlineTypography: () => ReturnType
    }
    blockSpacing: {
      setBlockSpacing: (attributes: BlockSpacingAttributes) => ReturnType
      unsetBlockSpacing: () => ReturnType
      /** Leading on the current block(s). */
      setBlockLineHeight: (lineHeight: string | null) => ReturnType
    }
  }
}

export interface InlineTypographyAttributes {
  fontWeight?: string | null
  letterSpacing?: string | null
  wordSpacing?: string | null
  fontKerning?: string | null
  textTransform?: string | null
}

export interface BlockSpacingAttributes {
  marginTop?: string | null
  marginBottom?: string | null
  lineHeight?: string | null
}

/** `<sup>` — StarterKit ships neither superscript nor subscript. */
export const Superscript = Mark.create({
  name: "superscript",
  excludes: "subscript",

  parseHTML() {
    return [
      { tag: "sup" },
      {
        style: "vertical-align",
        getAttrs: (value) => (value === "super" ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleSuperscript:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },
})

/** `<sub>` */
export const Subscript = Mark.create({
  name: "subscript",
  excludes: "superscript",

  parseHTML() {
    return [
      { tag: "sub" },
      {
        style: "vertical-align",
        getAttrs: (value) => (value === "sub" ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["sub", mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleSubscript:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },
})

const INLINE_KEYS: (keyof InlineTypographyAttributes)[] = [
  "fontWeight",
  "letterSpacing",
  "wordSpacing",
  "fontKerning",
  "textTransform",
]

/**
 * Extra inline properties hung off the shared `textStyle` mark, the same way
 * Tiptap's own Color / FontSize / FontFamily extensions do it. Reusing one
 * mark means weight, tracking and colour collapse into a single `<span>`
 * rather than nesting one span per property.
 */
export const InlineTypography = Extension.create({
  name: "inlineTypography",

  addOptions() {
    return { types: ["textStyle"] }
  },

  addGlobalAttributes() {
    const cssProperty: Record<keyof InlineTypographyAttributes, string> = {
      fontWeight: "font-weight",
      letterSpacing: "letter-spacing",
      wordSpacing: "word-spacing",
      fontKerning: "font-kerning",
      textTransform: "text-transform",
    }

    return [
      {
        types: this.options.types,
        attributes: Object.fromEntries(
          INLINE_KEYS.map((key) => [
            key,
            {
              default: null,
              parseHTML: (element: HTMLElement) => element.style[key] || null,
              renderHTML: (attributes: Record<string, unknown>) =>
                attributes[key] ? { style: `${cssProperty[key]}: ${attributes[key]}` } : {},
            },
          ])
        ),
      },
    ]
  },

  addCommands() {
    return {
      setInlineTypography:
        (attributes) =>
        ({ chain }) =>
          chain().setMark("textStyle", attributes).run(),

      unsetInlineTypography:
        () =>
        ({ chain }) =>
          chain()
            .setMark(
              "textStyle",
              Object.fromEntries(INLINE_KEYS.map((key) => [key, null]))
            )
            .removeEmptyTextStyle()
            .run(),
    }
  },
})

/** `<kbd>` — for documenting keystrokes inside a post. */
export const KeyboardKey = Mark.create({
  name: "keyboardKey",

  parseHTML() {
    return [{ tag: "kbd" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["kbd", mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleKeyboardKey:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },
})

/**
 * Ids on headings, so a generated table of contents has somewhere to link to.
 */
export const HeadingId = Extension.create({
  name: "headingId",

  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("id"),
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.id ? { id: attributes.id } : {},
          },
        },
      },
    ]
  },
})

/**
 * Lets a link carry an `id`, which is what makes in-page anchor targets
 * (`#pricing`) possible. StarterKit's Link mark has no id attribute of its own.
 */
export const AnchorId = Extension.create({
  name: "anchorId",

  addGlobalAttributes() {
    return [
      {
        types: ["link"],
        attributes: {
          id: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("id"),
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.id ? { id: attributes.id } : {},
          },
        },
      },
    ]
  },
})

/**
 * Block-level spacing and leading, as node attributes rather than marks so
 * they survive the text inside being rewritten.
 *
 * Leading lives here rather than using Tiptap's `LineHeight`: that extension
 * accepts a `types` option but its `setLineHeight` command always writes to
 * the `textStyle` mark, so configuring it for block nodes registers the
 * attribute and then silently drops every write.
 */
export const BlockSpacing = Extension.create({
  name: "blockSpacing",

  addOptions() {
    return { types: ["paragraph", "heading", "blockquote", "listItem"] }
  },

  addGlobalAttributes() {
    const build = (key: "marginTop" | "marginBottom" | "lineHeight", css: string) => ({
      default: null,
      parseHTML: (element: HTMLElement) => element.style[key] || null,
      renderHTML: (attributes: Record<string, unknown>) =>
        attributes[key] ? { style: `${css}: ${attributes[key]}` } : {},
    })

    return [
      {
        types: this.options.types,
        attributes: {
          marginTop: build("marginTop", "margin-top"),
          marginBottom: build("marginBottom", "margin-bottom"),
          lineHeight: build("lineHeight", "line-height"),
        },
      },
    ]
  },

  addCommands() {
    return {
      setBlockSpacing:
        (attributes) =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          let touched = false

          // Walk the selection so styling several paragraphs at once works,
          // not just the block the caret happens to sit in.
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            touched = true
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attributes })
            }
          })

          return touched
        },

      unsetBlockSpacing:
        () =>
        ({ commands }) =>
          commands.setBlockSpacing({ marginTop: null, marginBottom: null }),

      setBlockLineHeight:
        (lineHeight) =>
        ({ commands }) =>
          commands.setBlockSpacing({ lineHeight }),
    }
  },
})
