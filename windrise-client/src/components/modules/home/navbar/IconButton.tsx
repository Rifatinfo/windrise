
import { BoxIcon } from 'lucide-react'
type IconButtonProps = {
  icon: typeof  BoxIcon
  label: string
  onClick?: () => void
  className?: string
}
export function IconButton({
  icon: Icon,
  label,
  onClick,
  className = '',
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition duration-200 hover:translate-y-0.5 hover:opacity-60 font-dm-sans ${className}`}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.45} />
    </button>
  )
}
