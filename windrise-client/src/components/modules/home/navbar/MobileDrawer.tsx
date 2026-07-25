'use client';
import React, { useEffect, useState, Children } from 'react'
import type { Variants } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PackageIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserRoundIcon,
  XIcon,
  LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AccordionMenu } from './AccordionMenu'
import { IconButton } from './IconButton'
import {
  getNavigationCategory,
  navigationData,
  NavigationCategory,
  NavigationCategoryId,
} from './Navigationdataset'
import WhiteLogo from '@/components/shared/logo/WhiteLogo';

type MobileDrawerProps = {
  isOpen: boolean
  onClose: () => void
}
type DrawerLevel = 1 | 2
type TransitionDirection = 1 | -1
type AccountLink = {
  label: string
  icon: LucideIcon
}
const accountLinks: readonly AccountLink[] = [
  {
    label: 'My Account',
    icon: UserRoundIcon,
  },
  {
    label: 'Track Order',
    icon: PackageIcon,
  },
  {
    label: 'Wishlist',
    icon: HeartIcon,
  },
  {
    label: 'Shopping Cart',
    icon: ShoppingBagIcon,
  },
  {
    label: 'Sign In',
    icon: UserRoundIcon,
  },
]


const panelVariants : Variants = {
  enter: (direction : TransitionDirection) => ({
    x: direction === 1 ? "100%" : "-100%",
  }),

  center: {
    x: 0,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: (direction : TransitionDirection) => ({
    x: direction === 1 ? "-100%" : "100%",
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [level, setLevel] = useState<DrawerLevel>(1)
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<NavigationCategoryId>('men')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [direction, setDirection] = useState<TransitionDirection>(1)
  useEffect(() => {
    if (!isOpen) {
      setLevel(1)
      setSelectedCategoryId('men')
      setOpenGroup(null)
      setDirection(1)
    }
  }, [isOpen])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  const selectCategory = (id: NavigationCategoryId) => {
    setDirection(1)
    setSelectedCategoryId(id)
    setOpenGroup(null)
    setLevel(2)
  }
  const returnToDepartments = () => {
    setDirection(-1)
    setOpenGroup(null)
    setLevel(1)
  }
  const selectedCategory = getNavigationCategory(selectedCategoryId)
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-50 bg-black/45"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.42,
              ease: [0.25, 1, 0.5, 1] as const,
            }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{
              x: '100%',
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: '100%',
            }}
            transition={{
              duration: 0.42,
              ease: [0.32, 0.72, 0, 1] as const,
            }}
            className="fixed inset-0 z-[60] flex h-dvh w-screen flex-col overflow-hidden bg-[#080808] text-white font-dm-sans"
          >
            <div className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#080808] px-5">
              <WhiteLogo/>
              <div className="flex items-center gap-1">
                <IconButton icon={SearchIcon} label="Search" />
                <IconButton icon={XIcon} label="Close menu" onClick={onClose} />
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#080808]">
              <AnimatePresence initial={false} custom={direction} >
                {level === 1 ? (
                  <DrawerPanel key="departments" direction={direction}>
                    <DrawerLevelOne onSelectCategory={selectCategory} />
                  </DrawerPanel>
                ) : (
                  <DrawerPanel
                    key={`category-${selectedCategory.id}`}
                    direction={direction}
                  >
                    <DrawerCategory
                      category={selectedCategory}
                      openGroup={openGroup}
                      onBack={returnToDepartments}
                      onGroupToggle={(groupName) =>
                        setOpenGroup((current) =>
                          current === groupName ? null : groupName,
                        )
                      }
                    />
                  </DrawerPanel>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
function DrawerPanel({
  children,
  direction,
}: {
  children: React.ReactNode
  direction: TransitionDirection
}) {
  return (
    <motion.div
      custom={direction}
      variants={panelVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 flex min-h-0 flex-col overflow-y-auto bg-[#080808] px-5 pb-6"
    >
      {children}
    </motion.div>
  )
}
function DrawerLevelOne({
  onSelectCategory,
}: {
  onSelectCategory: (id: NavigationCategoryId) => void
}) {
  return (
    <>
      <motion.nav
        aria-label="Shop departments"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.04,
            },
          },
        }}
        
      >
        {navigationData.map((category, index) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            // className="flex w-full items-center justify-between border-b border-white/15 py-5 text-left text-[13px] font-medium font-dm-sans text-white/90 transition hover:text-white"
            className={`
        flex w-full items-center justify-between
        py-5 text-left text-[15px] font-medium font-dm-sans
        text-[#8A8A8A] transition hover:text-white
        ${
          index !== navigationData.length - 1
            ? "border-b border-[#272727]/70"
            : ""
        }
      `}
          >
            {category.label}
            <ChevronRightIcon size={16} strokeWidth={1.3} />
          </button>
        ))}
      </motion.nav>

      <div className="mt-auto space-y-4 pt-6 font-dm-sans">
        {accountLinks.map(({ icon: Icon, label }) => (
          <a
            key={label}
            href="#account"
            className="flex items-center gap-2.5 text-[15px] text-white transition hover:text-white font-dm-sans"
          >
            <Icon  size={14} strokeWidth={2} />
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
function DrawerCategory({
  category,
  openGroup,
  onBack,
  onGroupToggle,
}: {
  category: NavigationCategory
  openGroup: string | null
  onBack: () => void
  onGroupToggle: (groupName: string) => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex h-9 items-center gap-1 text-[15px] text-[#707070] transition hover:text-white font-dm-sans mt-5 "
      >
        <ChevronLeftIcon size={15} strokeWidth={1.3} />
        {category.label}
      </button>
      <div className="-mx-6 border-b border-[#272727]/70 mb-2 " />
      <nav
        aria-label={`${category.label} subcategories`}
        // className="border-t border-[#707070]/40 font-dm-sans"   // top 
      >
        {category.groups.map((group, index) => (
          <AccordionMenu
            key={group.name}
            title={group.name}
            items={group.items}
            isOpen={openGroup === group.name}
            onToggle={() => onGroupToggle(group.name)}
             isLast={index === category.groups.length - 1}
          />
        ))}
      </nav>

      <FeaturedCollections items={category.collections} />
      <PromoImage category={category} />
    </>
  )
}
function FeaturedCollections({ items }: { items: readonly string[] }) {
  return (
    <section className="mt-7">
      {/* <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        Featured collections
      </p> */}
      <div className="mt-3 space-y-2.5">
        {items.map((collection) => (
          <a
            key={collection}
            href="#collection"
            className="block text-[15px] text-[#707070] transition hover:text-white font-dm-sans"
          >
            {collection}
          </a>
        ))}
      </div>
    </section>
  )
}
function PromoImage({ category }: { category: NavigationCategory }) {
  return (
    <a
      href="#collection"
      aria-label={category.promo.cta}
      className="mt-8 block overflow-hidden rounded-md font-dm-sans"
    >
      <img
        src={category.promo.image}
        alt={category.promo.imageAlt}
        className="aspect-[4/5] w-full object-cover"
      />
      
    </a>
  )
}



             



