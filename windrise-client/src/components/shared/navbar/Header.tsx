'use client';
import  { useEffect, useState, useRef } from 'react'
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
import { MegaMenu } from '@/components/modules/home/navbar/MegaMenu'
import { MobileDrawer } from '@/components/modules/home/navbar/MobileDrawer'
import { getNavigationCategory, NavigationCategoryId } from '@/components/modules/home/navbar/Navigationdataset'
import WhiteLogo from '../logo/WhiteLogo';


export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [activeCategoryId, setActiveCategoryId] =
    useState<NavigationCategoryId | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 22)
    handleScroll()
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })
    return () => window.removeEventListener('scroll', handleScroll)
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
  return (
    <>
      <header
        onMouseLeave={scheduleCategoryClose}
        onMouseEnter={clearCloseTimer}
        className={`fixed  inset-x-0 top-0 z-[9999] text-white font-dm-sans transition-[background-color,backdrop-filter] duration-300 ${hasScrolled || activeCategory ? 'bg-black backdrop-blur-md' : 'bg-transparent'}`}
      >
        <div className="mx-auto hidden h-20 w-full grid-cols-[200px_1fr_auto] items-center px-6  lg:px-20 md:px-20 lg:grid ">
          <WhiteLogo/>

          <div >
            <DesktopNav
            activeCategory={activeCategoryId}
            onCategoryOpen={openCategory}
            onCategoryToggle={toggleCategory}
          />
          </div>

          <div className="flex justify-end gap-0.5  md:-mr-4 lg:-mr-4">
            <IconButton icon={SearchIcon} label="Search" />
            <IconButton icon={HeartIcon} label="Wishlist" />
            <IconButton icon={ShoppingBagIcon} label="Shopping bag" />
            <IconButton icon={UserRoundIcon} label="Account" />
          </div>
        </div>

        <div className="lg:hidden">
          <MobileHeader onMenuOpen={() => setIsDrawerOpen(true)} />
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
