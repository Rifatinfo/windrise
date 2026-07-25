
// 'use client';

// import { motion } from 'framer-motion'
// import type { NavigationCategory } from './Navigationdataset'

// type MegaMenuProps = {
//   category: NavigationCategory
//   onMouseEnter: () => void
//   onMouseLeave: () => void
// }

// // Group column sizes, sliced to however many groups a category actually has
// // (prevents the leftover empty-track bug when a category has fewer than 3
// // groups, e.g. "men" only has Clothing + Footwear).
// const GROUP_COLUMN_SIZES = ['1.18fr', '1fr', '1.08fr', '1fr', '1fr'] as const

// // Exact gap the design calls for between the last content column and the
// // promo image when a category has only 2 groups. 3-group categories keep
// // the normal grid gap (gap-x-20) with no override.
// const TWO_COLUMN_IMAGE_GAP_PX = 253

// export function MegaMenu({
//   category,
//   onMouseEnter,
//   onMouseLeave,
// }: MegaMenuProps) {
//   const isTwoColumn = category.groups.length === 2

//   // 200px matches the header's `grid-cols-[200px_1fr_auto]` logo column.
//   // Using a fixed px width here (not a proportional fr) means whatever
//   // comes right after it — the first group column, "Clothing" — always
//   // starts at the same x-position as "Men" in the header nav, since both
//   // containers share the same px-6 lg:px-15 outer padding.
//   const gridTemplateColumns = [
//     '100px', // collections — fixed width, matches header logo column
//     ...GROUP_COLUMN_SIZES.slice(0, category.groups.length), // exactly N group tracks
//     '1.28fr', // promo image
//   ].join(' ')

//   return (
//     <motion.section
//       id="desktop-mega-menu"
//       aria-label={`${category.label} collections`}
//       initial={{ opacity: 0, y: -18 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className="absolute left-0 top-20 z-40 w-full bg-[#080808] text-white shadow-[0_22px_42px_rgba(0,0,0,0.38)]"
//     >
//       <div
//         className="mx-auto grid gap-x-20 px-6 lg:px-15 py-6 "
//         style={{ gridTemplateColumns }}
//       >
//         <section className="pt-1">
//           <ul className="space-y-2.5 ">
//             {category.collections.map((collection) => (
//               <li key={collection}>
//                 <a
//                   href="#collection"
//                   className="text-[15px] font-medium text-[#707070] transition duration-200 hover:translate-x-0.5 hover:text-white font-dm-sans"
//                 >
//                   {collection}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </section>

//         {category.groups.map((group) => (
//           <MenuColumn key={group.name} title={group.name} items={group.items} />
//         ))}

//         <a
//           href="#collection"
//           aria-label={category.promo.cta}
//           className="block self-start overflow-hidden rounded-md"
//           // Grid's own gap-x-20 already applies between every track. For the
//           // 2-group case, add the extra margin needed to make the *total*
//           // space between the last content column and the image exactly
//           // 253px, per the design. 80px (gap-x-20) + 173px = 253px.
//           style={isTwoColumn ? { marginLeft: `${TWO_COLUMN_IMAGE_GAP_PX - 80}px` } : undefined}
//         >
//           <img
//             src={category.promo.image}
//             alt={category.promo.imageAlt}
//             className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-[1.025]"
//           />
//         </a>
//       </div>
//     </motion.section>
//   )
// }

// type MenuColumnProps = {
//   title: string
//   items: readonly string[]
// }

// function MenuColumn({ title, items }: MenuColumnProps) {
//   return (
//     <section>
//       <h2 className="border-b border-[#707070] pb-2 text-[15px] font-medium text-[#707070] font-dm-sans ">
//         {title}
//       </h2>
//       <ul className="mt-2.5 space-y-1.5 ">
//         {items.map((item) => (
//           <li key={item}>
//             <a
//               href="#collection"
//               className="block text-[15px] text-[#707070] transition duration-200 hover:translate-x-0.5 hover:text-white font-dm-sans"
//             >
//               {item}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </section>
//   )
// }


'use client';

import { motion } from 'framer-motion';
import type { NavigationCategory } from './Navigationdataset';
import Image from "next/image";
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
          className="relative block justify-self-end overflow-hidden rounded-md group"
        >
          <Image
            height={306}
            width={544}
            src={category.promo.image}
            alt={category.promo.imageAlt}
            className="aspect-[4/5] w-[544px] h-[306px] object-cover transition duration-500 group-hover:scale-[1.03]"
          />

          {/* Gradient overlay: transparent at top -> black at bottom */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent"
          />

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
              Explore <span className='w-0.5' aria-hidden>→</span>
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
