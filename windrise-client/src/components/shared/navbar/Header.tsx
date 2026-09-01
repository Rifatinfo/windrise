'use client';
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { DesktopNav } from '@/components/modules/home/navbar/DesktopNav'
import { HeaderIconButton } from '@/components/modules/home/navbar/HeaderIconButton'
import { MobileHeader } from '@/components/modules/home/navbar/MobileHeader'
import { useCart } from '@/contexts/CartContext'
import { MegaMenu } from '@/components/modules/home/navbar/MegaMenu'
import { MobileDrawer } from '@/components/modules/home/navbar/MobileDrawer'
import { getNavigationCategory, NavigationCategoryId } from '@/components/modules/home/navbar/Navigationdataset'
import WhiteLogo from '../logo/WhiteLogo';
import BlackLogo from '../logo/BlackLogo';


export function Header() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [isHidden, setIsHidden] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeCategoryId, setActiveCategoryId] =
    useState<NavigationCategoryId | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const scrollStopTimer = useRef<number | undefined>(undefined)
  const activeCategoryRef = useRef(activeCategoryId)
  const drawerOpenRef = useRef(isDrawerOpen)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    activeCategoryRef.current = activeCategoryId
  }, [activeCategoryId])

  useEffect(() => {
    drawerOpenRef.current = isDrawerOpen
  }, [isDrawerOpen])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setHasScrolled(current > 22)

      if (activeCategoryRef.current || drawerOpenRef.current) {
        setIsHidden(false)
        return
      }

      // Show while scrolling, hide after scroll idle
      setIsHidden(false)
      setIsScrolling(true)
      window.clearTimeout(scrollStopTimer.current)
      scrollStopTimer.current = window.setTimeout(() => {
        setIsScrolling(false)
        if (window.scrollY > 0 && !activeCategoryRef.current && !drawerOpenRef.current) {
          setIsHidden(true)
        }
      }, 2000)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.clearTimeout(scrollStopTimer.current)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCategoryId(null)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const clearCloseTimer = () => window.clearTimeout(closeTimer.current)
  const openCategory = (id: NavigationCategoryId) => {
    clearCloseTimer()
    setActiveCategoryId(id)
  }
  const toggleCategory = (id: NavigationCategoryId) => {
    clearCloseTimer()
    setActiveCategoryId((current) => (current === id ? null : id))
  }
  const scheduleCategoryClose = () => {
    closeTimer.current = window.setTimeout(() => setActiveCategoryId(null), 140)
  }
  const activeCategory = activeCategoryId
    ? getNavigationCategory(activeCategoryId)
    : null

  const isHome = mounted ? pathname === '/' : false

  useEffect(() => {
    if (
      !activeCategoryId &&
      !isDrawerOpen &&
      !isScrolling &&
      window.scrollY > 0
    ) {
      setIsHidden(true)
    }
  }, [activeCategoryId, isDrawerOpen, isScrolling])

  const isDark = hasScrolled || activeCategoryId !== null || isDrawerOpen
  const headerBg = isDark
    ? 'bg-black backdrop-blur-md'
    : 'bg-transparent'
  const headerText = isDark || isHome ? 'text-white' : 'text-black'
  const Logo = isHome || isDark ? WhiteLogo : BlackLogo
  // Same condition as the logo, so wordmark and icons never disagree: light
  // artwork on the home page and over the dark scrolled header, dark elsewhere.
  const iconTone = isHome || isDark ? 'white' : 'black'

  
  return (
    <>
      <header
        onMouseLeave={scheduleCategoryClose}
        onMouseEnter={clearCloseTimer}
        // `-translate-y-full` compiles to the `translate` property in Tailwind
        // v4, not `transform`. The transition used to list only `transform`,
        // so the header was snapping in and out with nothing animating.
        //
        // It leaves and returns on different curves: an accelerating ease out
        // of view so it gets out of the way, and a decelerating one on the way
        // back so it settles rather than arriving abruptly.
        className={`fixed inset-x-0 top-0 z-[9999] font-dm-sans transition-[background-color,backdrop-filter,translate,opacity] ${headerBg} ${headerText} ${
          isHidden
            ? '-translate-y-full opacity-0 duration-[420ms] ease-[cubic-bezier(0.55,0,1,0.45)]'
            : 'translate-y-0 opacity-100 duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
        }`}
      >
        <div className="mx-auto  hidden h-20 w-full grid-cols-[200px_1fr_auto] items-center px-6 lg:px-20 md:px-20 lg:grid">
          <Logo />

          <div>
            <DesktopNav
              activeCategory={activeCategoryId}
              onCategoryOpen={openCategory}
              onCategoryToggle={toggleCategory}
            />
          </div>

          <div className="flex justify-end gap-0.5 md:-mr-2.5 lg:-mr-2.5">
            <HeaderIconButton name="search" tone={iconTone} />
            <HeaderIconButton name="wishlist" tone={iconTone} />
            <Link href="/shoppingBag" className="relative inline-flex">
              <HeaderIconButton name="cart" tone={iconTone} />
              {itemCount > 0 && (
                <span
                  // Inverted against the icons, or the badge disappears: it was
                  // always white, which vanished on the pages that render a
                  // light header.
                  className={`absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold transition-colors duration-300 ${
                    iconTone === 'white'
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                  }`}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <HeaderIconButton name="account" tone={iconTone} />
          </div>
        </div>

        <div className="lg:hidden">
          <MobileHeader
            isMenuOpen={isDrawerOpen}
            onMenuToggle={() => setIsDrawerOpen((open) => !open)}
            logoVariant={isHome || isDark ? 'white' : 'black'}
          />
        </div>

        <AnimatePresence initial={false}>
          {activeCategory && (
            <MegaMenu
              category={activeCategory}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleCategoryClose}
            />
          )}
        </AnimatePresence>
      </header>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
