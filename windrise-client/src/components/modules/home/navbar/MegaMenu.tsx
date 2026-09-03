

'use client';

import { motion } from 'framer-motion';
import type { NavigationCategory } from './Navigationdataset';
import Image from "next/image";
import { ArrowRight } from 'lucide-react';
type MegaMenuProps = {
  category: NavigationCategory;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function MegaMenu({
  category,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  // Always render TWO content columns
  const middleIndex = Math.ceil(category.groups.length / 2);

  const leftGroups = category.groups.slice(0, middleIndex);
  const rightGroups = category.groups.slice(middleIndex);

  return (
    <motion.section
      id="desktop-mega-menu"
      aria-label={`${category.label} collections`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 top-20 z-40 w-full bg-black text-white shadow-[0_22px_42px_rgba(0,0,0,0.38)] lg:px-4"
    >
      <div
        className="
          mx-auto
          grid
          px-6
          lg:px-15
          py-8
          gap-x-20
          items-start
        "
        style={{
          // Collections | Left | Right | Image
          gridTemplateColumns: '120px 326px 230px minmax(320px,1fr)',
        }}
      >
        {/* Collections */}
        <nav>
          <ul className="space-y-3">
            {category.collections.map((collection) => (
              <li key={collection}>
                <a
                  href="#"
                  className="font-medium text-[#707070] transition duration-200 hover:translate-x-0.5 hover:text-white font-dm-sans"
                >
                  {collection}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Left Column */}
        <div className="space-y-10">
          {leftGroups.map((group) => (
            <MenuColumn
              key={group.name}
              title={group.name}
              items={group.items}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {rightGroups.map((group) => (
            <MenuColumn
              key={group.name}
              title={group.name}
              items={group.items}
            />
          ))}
        </div>

        {/* Promo Image */}
        {/* <a
          href="#collection"
          aria-label={category.promo.cta}
          className="block justify-self-end overflow-hidden rounded-md"
        >
          <Image
            height={306}
            width={544}
            src={category.promo.image}
            alt={category.promo.imageAlt}
            className="aspect-[4/5] w-[544px] h-[306px] object-cover transition duration-500 hover:scale-[1.03]"
          />
        </a> */}
        
        {/* Promo Image */}
       <a
          href="#collection"
          aria-label={category.promo.cta}
          className="relative block justify-self-end overflow-hidden  group"
        >
          <Image
            height={306}
            width={544}
            src={category.promo.image}
            alt={category.promo.imageAlt}
            className="aspect-[4/5] w-[544px] h-[306px] object-cover transition duration-500 group-hover:scale-[1.03]"
          />

          {/* Gradient overlay: transparent at top -> black at bottom */}
          {/* <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent"
          /> */}
           <div className="absolute inset-0  group-hover:bg-black/10  bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-colors duration-500" />

          {/* Text content */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white font-dm-sans">
            <span className="text-xs font-medium tracking-widest uppercase text-white/80">
              {/* {category.promo.label /* "FEATURED" */}   FEATURED
            </span>
            <h3 className="mt-1 text-2xl font-medium">
              {/* {category.promo.title /* "Explore the Trend" */}  Explore the Trend
            </h3>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-light underline-offset-4">
              {/* {category.promo.cta /* "Explore" */}  
              Explore <span><ArrowRight className="ml-2 w-4 h-4" /></span>
            </span>
          </div>
        </a>   
              </div>
            </motion.section>
          );                                                  
        }

type MenuColumnProps = {
  title: string;
  items: readonly string[];
};

function MenuColumn({ title, items }: MenuColumnProps) {
  return (
    <div>
      <h3 className="mb-4 w-86 border-b border-[#707070] pb-2  font-medium text-[#707070] font-dm-sans">
        {title}
      </h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <a
              href="#"
              className="block  text-[#707070] transition duration-200 hover:translate-x-0.5 hover:text-white font-dm-sans"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
