/**
 * The SEO checklist beside the post editor, scored as you type.
 *
 * Mirrors `windrise-server/src/app/modules/blog/blog.seo.ts` exactly — the
 * server recomputes the same score on save so the list view and the editor
 * never disagree. Change one, change the other.
 */
export type SeoCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
};

export type SeoInput = {
  title?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  content?: string | null;
};

/** Strip tags without a DOM so this also works during SSR. */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(html?: string | null): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function buildSeoChecks(input: SeoInput): SeoCheck[] {
  const title = (input.title ?? "").trim();
  const metaTitle = (input.metaTitle ?? "").trim();
  const metaDescription = (input.metaDescription ?? "").trim();
  const focusKeyword = (input.focusKeyword ?? "").trim();
  const words = countWords(input.content);

  return [
    { id: "title", label: "Add a post title", passed: title.length > 0, weight: 15 },
    {
      id: "meta-title",
      label: "Set a meta title (≤60 chars)",
      passed: metaTitle.length > 0 && metaTitle.length <= 60,
      weight: 20,
    },
    {
      id: "meta-description",
      label: "Set a meta description (120–160 chars)",
      passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      weight: 25,
    },
    {
      id: "focus-keyword",
      label: "Add a focus keyword",
      passed: focusKeyword.length > 0,
      weight: 20,
    },
    {
      id: "word-count",
      label: "Write at least 300 words",
      passed: words >= 300,
      weight: 20,
    },
  ];
}

export function computeSeoScore(input: SeoInput): number {
  return buildSeoChecks(input).reduce(
    (total, check) => total + (check.passed ? check.weight : 0),
    0
  );
}

export function seoBand(score: number): "Good" | "OK" | "Needs work" {
  return score >= 70 ? "Good" : score >= 40 ? "OK" : "Needs work";
}

export function seoBandColor(score: number): string {
  return score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";
}
