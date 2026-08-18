import DOMPurify from "isomorphic-dompurify";

export const PRODUCT_DESCRIPTION_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "mark",
  "code",
  "pre",
];

export const PRODUCT_DESCRIPTION_ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "style",
  "data-color",
  "colspan",
  "rowspan",
];

DOMPurify.addHook("afterSanitizeAttributes", (node: any) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

/**
 * Sanitizes admin-authored product description HTML down to a safe
 * allowlist before it is persisted. This is the source of truth for what
 * ends up in the database — the client sanitizes too, but that is only a
 * UX/defense-in-depth layer, not something this server can trust.
 */
export function sanitizeProductDescription(
  html: string | null | undefined
): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: PRODUCT_DESCRIPTION_ALLOWED_TAGS,
    ALLOWED_ATTR: PRODUCT_DESCRIPTION_ALLOWED_ATTR,
  }).trim();
}

export function stripHtmlToText(html: string | null | undefined): string {
  if (!html) return "";
  const text = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return text.replace(/\s+/g, " ").trim();
}

/**
 * A Tiptap-empty document serializes to "<p></p>" — treat that (and
 * whitespace-only content) as empty even though the string is non-empty.
 */
export function hasMeaningfulHtmlContent(
  html: string | null | undefined
): boolean {
  if (!html) return false;
  if (stripHtmlToText(html).length > 0) return true;
  return /<(img|table|hr)\b/i.test(html);
}
