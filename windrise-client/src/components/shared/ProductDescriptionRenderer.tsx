import { sanitizeProductDescription } from "@/lib/sanitizeHtml"

interface ProductDescriptionRendererProps {
  html: string | null | undefined
  className?: string
  fallback?: string
}

/**
 * Centralized renderer for admin-authored product description HTML.
 * Always sanitizes before injecting — this is the only place in the app
 * that should call dangerouslySetInnerHTML for product descriptions.
 */
export function ProductDescriptionRenderer({
  html,
  className,
  fallback = "No description available.",
}: ProductDescriptionRendererProps) {
  const safeHtml = sanitizeProductDescription(html)

  if (!safeHtml) {
    return <p className={className}>{fallback}</p>
  }

  return (
    <div
      className={`product-description ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
