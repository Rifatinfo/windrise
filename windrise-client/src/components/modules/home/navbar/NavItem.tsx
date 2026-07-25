
type NavItemProps = {
  label: string
  active: boolean
  controls: string
  onClick: () => void
  onMouseEnter: () => void
  onFocus: () => void
}
export function NavItem({
  label,
  active,
  controls,
  onClick,
  onMouseEnter,
  onFocus,
}: NavItemProps) {
  return (
    <button
      type="button"
      aria-controls={controls}
      aria-expanded={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      className={`relative py-2  font-medium font-dm-sans tracking-[-0.01em] transition duration-200 hover:translate-y-0.5 hover:opacity-60 cursor-pointer ${active ? 'opacity-100 ' : 'opacity-90'}`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-current transition-all duration-200 ${active ? 'w-full' : 'w-0'}`}
      />
    </button>
  )
}
