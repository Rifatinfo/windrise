import { sanitizePostContent } from "@/lib/sanitizeHtml"

interface PostContentRendererProps {
  html: string | null | undefined
  className?: string
  fallback?: string
}

/**
 * Centralized renderer for admin-authored blog post HTML.
 * Always sanitizes before injecting — this is the only place in the app
 * that should call dangerouslySetInnerHTML for post content.
 */
export function PostContentRenderer({
  html,
  className,
  fallback = "Nothing to preview yet — switch to Write to start the post.",
}: PostContentRendererProps) {
  const safeHtml = sanitizePostContent(html)

  if (!safeHtml) {
    return <p className={`text-sm text-muted-foreground ${className ?? ""}`}>{fallback}</p>
  }

  return (
    <div
      // `product-description` is the shared read-only render class: it carries
      // the same typography and media geometry as the editing surface, so
      // Preview and the published post match Write exactly.
      className={`product-description post-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
