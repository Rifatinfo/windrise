"use client";
import React, { useEffect, useState, Children } from "react";
import type { Variants } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserRoundIcon,
  LucideIcon,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AccordionMenu } from "./AccordionMenu";
import { MENU_DURATION, MENU_EASE } from "./MenuToggle";
import {
  getNavigationCategory,
  navigationData,
  NavigationCategory,
  NavigationCategoryId,
} from "./Navigationdataset";
import Image from "next/image";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};
type DrawerLevel = 1 | 2;
type TransitionDirection = 1 | -1;
type AccountLink = {
  label: string;
  icon: LucideIcon;
};
const accountLinks: readonly AccountLink[] = [
  {
    label: "My Account",
    icon: UserRoundIcon,
  },
  {
    label: "Track Order",
    icon: PackageIcon,
  },
  {
    label: "Wishlist",
    icon: HeartIcon,
  },
  {
    label: "Shopping Cart",
    icon: ShoppingBagIcon,
  },
  {
    label: "Sign In",
    icon: UserRoundIcon,
  },
];

const panelVariants: Variants = {
  enter: (direction: TransitionDirection) => ({
    x: direction === 1 ? "100%" : "-100%",
  }),

  center: {
    x: 0,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: (direction: TransitionDirection) => ({
    x: direction === 1 ? "-100%" : "100%",
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [level, setLevel] = useState<DrawerLevel>(1);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<NavigationCategoryId>("men");
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [direction, setDirection] = useState<TransitionDirection>(1);
  useEffect(() => {
    if (!isOpen) {
      setLevel(1);
      setSelectedCategoryId("men");
      setOpenGroup(null);
      setDirection(1);
    }
  }, [isOpen]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const selectCategory = (id: NavigationCategoryId) => {
    setDirection(1);
    setSelectedCategoryId(id);
    setOpenGroup(null);
    setLevel(2);
  };
  const returnToDepartments = () => {
    setDirection(-1);
    setOpenGroup(null);
    setLevel(1);
  };
  const selectedCategory = getNavigationCategory(selectedCategoryId);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            // Below the site header (z-9999): the header stays visible above
            // the panel and carries the only menu control, which is what lets
            // the bars morph into the cross instead of being swapped out.
            className="fixed inset-0 z-[9990] bg-black/45"
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
            // Drops in from above and retracts upward, sharing the toggle's
            // timing so the bars and the panel read as one movement.
            initial={{
              y: "-100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "-100%",
            }}
            transition={{
              duration: MENU_DURATION,
              ease: MENU_EASE,
            }}
            className="fixed inset-0 z-[9995] flex h-dvh w-screen flex-col overflow-hidden bg-[#080808] text-white font-dm-sans"
          >
            {/* Clears the fixed header, which stays visible above the panel
                and holds the only menu control. */}
            <div className="h-16 shrink-0" aria-hidden="true" />

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#080808]">
              <AnimatePresence initial={false} custom={direction}>
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
  );
}
function DrawerPanel({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: TransitionDirection;
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
  );
}
function DrawerLevelOne({
  onSelectCategory,
}: {
  onSelectCategory: (id: NavigationCategoryId) => void;
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
            <Icon size={14} strokeWidth={2} />
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
function DrawerCategory({
  category,
  openGroup,
  onBack,
  onGroupToggle,
}: {
  category: NavigationCategory;
  openGroup: string | null;
  onBack: () => void;
  onGroupToggle: (groupName: string) => void;
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
  );
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
  );
}
function PromoImage({ category }: { category: NavigationCategory }) {
  return (
  
     <a
      href="#collection"
      aria-label={category.promo.cta}
      className="group relative mt-8 block w-full shrink-0 overflow-hidden font-dm-sans"
    >
      <img
        src={category.promo.image}
        alt={category.promo.imageAlt}
        className="aspect-[4/5] w-full object-cover relative block justify-self-end overflow-hidden  group"
      />
        <div className="absolute inset-0  group-hover:bg-black/10  bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-colors duration-500" />

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white font-dm-sans">
        <span className="text-xs font-medium tracking-widest uppercase text-white/80">
          {/* {category.promo.label /* "FEATURED" */} FEATURED
        </span>
        <h3 className="mt-1 text-2xl font-medium">
          {/* {category.promo.title /* "Explore the Trend" */} Explore the Trend
        </h3>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-light underline-offset-4">
          {/* {category.promo.cta /* "Explore" */}
          Explore{" "}
          <span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </span>
        </span>
      </div>
      
    </a>
  );
}
