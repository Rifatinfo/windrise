import { TableCell, TableHeader } from "@tiptap/extension-table"

/**
 * Per-cell presentation attributes.
 *
 * `backgroundColor` fills a cell; `height` is applied to every cell in a row
 * by the table toolbar, which is how a row gets a height in HTML tables.
 * Both serialize into the cell's inline `style`, so they survive the
 * sanitizer and render identically on the public page.
 */
const styleAttributes = {
  backgroundColor: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
  height: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.height || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.height ? { style: `height: ${attributes.height}` } : {},
  },
}

export const StyledTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttributes }
  },
})

export const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...styleAttributes }
  },
})
