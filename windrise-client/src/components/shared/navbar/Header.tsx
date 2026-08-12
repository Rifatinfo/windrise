'use client';
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HeartIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserRoundIcon,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { DesktopNav } from '@/components/modules/home/navbar/DesktopNav'
import { IconButton } from '@/components/modules/home/navbar/IconButton'
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

  
  return (
    <>
      <header
        onMouseLeave={scheduleCategoryClose}
        onMouseEnter={clearCloseTimer}
        className={`fixed inset-x-0 top-0 z-[9999] font-dm-sans transition-[background-color,backdrop-filter,transform] duration-300 ease-out ${headerBg} ${headerText} ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="mx-auto hidden h-20 w-full grid-cols-[200px_1fr_auto] items-center px-6 lg:px-20 md:px-20 lg:grid">
          <Logo />

          <div>
            <DesktopNav
              activeCategory={activeCategoryId}
              onCategoryOpen={openCategory}
              onCategoryToggle={toggleCategory}
            />
          </div>

          <div className="flex justify-end gap-0.5 md:-mr-4 lg:-mr-4">
            <IconButton icon={SearchIcon} label="Search" />
            <IconButton icon={HeartIcon} label="Wishlist" />
            <Link href="/shoppingBag" className="relative inline-flex">
              <IconButton icon={ShoppingBagIcon} label="Shopping bag" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[9px] font-semibold text-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <IconButton icon={UserRoundIcon} label="Account" />
          </div>
        </div>

        <div className="lg:hidden">
          <MobileHeader
            onMenuOpen={() => setIsDrawerOpen(true)}
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
