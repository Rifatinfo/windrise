import WhiteLogo from '@/components/shared/logo/WhiteLogo'
import BlackLogo from '@/components/shared/logo/BlackLogo'
import { MenuToggle } from './MenuToggle'

type MobileHeaderProps = {
  /** Drives the bars-to-cross morph; the button is the only close control. */
  isMenuOpen: boolean
  onMenuToggle: () => void
  logoVariant?: 'white' | 'black'
}

export function MobileHeader({
  isMenuOpen,
  onMenuToggle,
  logoVariant = 'white',
}: MobileHeaderProps) {
  const Logo = logoVariant === 'white' ? WhiteLogo : BlackLogo

  return (
    <div className="flex h-16 items-center justify-between px-6">
      <Logo />
      <div className="-mr-2">
        <MenuToggle isOpen={isMenuOpen} onClick={onMenuToggle} />
      </div>
    </div>
  )
}
