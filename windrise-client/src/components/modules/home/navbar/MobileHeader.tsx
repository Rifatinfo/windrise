
import { MenuIcon, SearchIcon } from 'lucide-react'
import { IconButton } from './IconButton'
import WhiteLogo from '@/components/shared/logo/WhiteLogo'
type MobileHeaderProps = {
  onMenuOpen: () => void
}
export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between px-6 ">
     <WhiteLogo/>
      <div className='-mr-2'>
        <IconButton icon={MenuIcon} label="Open menu" onClick={onMenuOpen} />
      </div>
    </div>
  )
}
