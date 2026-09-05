'use client'

import { Suspense } from 'react'
import WhiteLogo from '@/components/shared/logo/WhiteLogo'
import BlackLogo from '@/components/shared/logo/BlackLogo'
import { SearchTrigger } from '@/components/modules/search/SearchTrigger'
import { HeaderIconButton } from './HeaderIconButton'
import { MenuToggle } from './MenuToggle'

type MobileHeaderProps = {
  /** Drives the bars-to-cross morph; the button is the only close control. */
  isMenuOpen: boolean
  onMenuToggle: () => void
  onSearchOpen: () => void
  logoVariant?: 'white' | 'black'
}

export function MobileHeader({
  isMenuOpen,
  onMenuToggle,
  onSearchOpen,
  logoVariant = 'white',
}: MobileHeaderProps) {
  const Logo = logoVariant === 'white' ? WhiteLogo : BlackLogo

  return (
    <div className="flex h-16 items-center justify-between px-6">
      <Logo />
      <div className="-mr-2 flex items-center gap-0.5">
        {/* Hidden behind the open drawer, which is its own full-screen
            surface and carries the menu control alone. */}
        {!isMenuOpen && (
          <Suspense
            fallback={<HeaderIconButton name="search" tone={logoVariant} />}
          >
            <SearchTrigger tone={logoVariant} onOpen={onSearchOpen} />
          </Suspense>
        )}
        <MenuToggle isOpen={isMenuOpen} onClick={onMenuToggle} />
      </div>
    </div>
  )
}
