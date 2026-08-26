import { sanitizePostContent } from "@/lib/sanitizeHtml";

/**
 * Cuts post HTML into sections at the given paragraph counts, so the page can
 * place things *inside* the article — the cover image after the opening, the
 * highlight further down — instead of bolting them on at either end.
 *
 * `counts` are cumulative paragraph indexes: [2, 5] yields three sections,
 * splitting after the 2nd and the 5th paragraph. The result always has
 * `counts.length + 1` entries, so callers can destructure without checking;
 * a short post simply leaves the later sections empty and its blocks fall
 * after the content rather than interrupting it.
 *
 * The content is sanitized once up front, which means the string being scanned
 * is an allowlisted subset — no scripts, no comments, no stray markup — and
 * Tiptap emits paragraphs as flat top-level `<p>` elements.
 */
export function splitIntoSections(
  html: string | null | undefined,
  counts: number[]
): string[] {
  const safe = sanitizePostContent(html);
  const sections: string[] = [];

  if (!safe) return counts.map(() => "").concat("");

  let cursor = 0;
  let paragraph = 0;

  for (const target of counts) {
    let cut = -1;

    while (paragraph < target) {
      const next = safe.indexOf("</p>", cursor);
      if (next === -1) break;
      cursor = next + "</p>".length;
      paragraph += 1;
      cut = cursor;
    }

    if (paragraph < target || cut === -1) {
      // Ran out of paragraphs: everything so far goes in this section and the
      // remaining sections stay empty.
      sections.push(safe.slice(sections.join("").length));
      while (sections.length <= counts.length) sections.push("");
      return sections;
    }

    sections.push(safe.slice(sections.join("").length, cut));
  }

  sections.push(safe.slice(sections.join("").length));
  return sections;
}
