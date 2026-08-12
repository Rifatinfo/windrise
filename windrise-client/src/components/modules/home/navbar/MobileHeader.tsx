
import { MenuIcon, SearchIcon } from 'lucide-react'
import { IconButton } from './IconButton'
import WhiteLogo from '@/components/shared/logo/WhiteLogo'
import BlackLogo from '@/components/shared/logo/BlackLogo'
type MobileHeaderProps = {
  onMenuOpen: () => void
  logoVariant?: 'white' | 'black'
}
export function MobileHeader({ onMenuOpen, logoVariant = 'white' }: MobileHeaderProps) {
  const Logo = logoVariant === 'white' ? WhiteLogo : BlackLogo
  return (
    <div className="flex h-16 items-center justify-between px-6 ">
     <Logo />
      <div className='-mr-2'>
        <IconButton icon={MenuIcon} label="Open menu" onClick={onMenuOpen} />
      </div>
    </div>
  )
}
