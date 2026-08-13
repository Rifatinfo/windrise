import Image from 'next/image'

// Mirrors resolveUrl() in ProductUpdateClient.tsx — API paths may be absolute,
// root-relative (served via the /uploads rewrite), or bare relative paths
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `${process.env.NEXT_PUBLIC_API_URL ?? ''}${trimmed}`
}

const sizeStyles = {
  sm: { box: 'h-9 w-9 rounded-xl', pixels: 36, text: 'text-base' },
  md: { box: 'h-12 w-12 rounded-2xl', pixels: 48, text: 'text-xl' },
} as const

interface ProductThumbProps {
  image: string | null
  name: string
  emoji: string
  size?: keyof typeof sizeStyles
}

export function ProductThumb({ image, name, emoji, size = 'sm' }: ProductThumbProps) {
  const src = resolveImageUrl(image)
  const style = sizeStyles[size]

  if (src) {
    return (
      <Image
        width={style.pixels}
        height={style.pixels}
        src={src}
        alt={name}
        className={`${style.box} shrink-0 border border-line bg-canvas object-cover`}
      />
    )
  }

  return (
    <span
      className={`flex ${style.box} shrink-0 items-center justify-center bg-canvas ${style.text}`}
      aria-hidden="true"
    >
      {emoji}
    </span>
  )
}
