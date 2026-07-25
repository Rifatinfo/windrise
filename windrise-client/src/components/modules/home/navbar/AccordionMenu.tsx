
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
type AccordionMenuProps = {
  title: string
  items: readonly string[]
  isOpen: boolean
  onToggle: () => void
   isLast?: boolean
}
export function AccordionMenu({
  title,
  items,
  isOpen,
  onToggle,
    isLast,
}: AccordionMenuProps) {
  return (
    // <div className={isLast ? "" : "border-b border-[#272727]/70"}>
    //   <button
    //     type="button"
    //     aria-expanded={isOpen}
    //     onClick={onToggle}
    //     className="flex w-full items-center justify-between py-4 text-left text-[14px] font-medium  text-[#8A8A8A] font-dm-sans"
    //   >
    //     {title}
    //     {isOpen ? (
    //       <ChevronDownIcon size={16} strokeWidth={1.3} />
    //     ) : (
    //       <ChevronRightIcon size={16} strokeWidth={1.3} />
    //     )}
    //   </button>
    //   <AnimatePresence initial={false}>
    //     {isOpen && (
    //       <motion.ul
    //         initial={{
    //           height: 0,
    //           opacity: 0,
    //         }}
    //         animate={{
    //           height: 'auto',
    //           opacity: 1,
    //         }}
    //         exit={{
    //           height: 0,
    //           opacity: 0,
    //         }}
    //         transition={{
    //           duration: 0.24,
    //           ease: [0.22, 1, 0.36, 1],
    //         }}
    //         className="overflow-hidden pb-3"
    //       >
    //         {items.map((item) => (
    //           <li key={item}>
    //             <a
    //               href="#collection"
    //               className="block py-1 text-[15px] text-[#8A8A8A] transition duration-200 hover:text-white font-dm-sans"
    //             >
    //               {item}
    //             </a>
    //           </li>
    //         ))}
    //       </motion.ul>
    //     )}
    //   </AnimatePresence>
    // </div>

      <div className={isLast ? "" : "border-b border-[#272727]/70"}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-[14px] font-medium text-[#8A8A8A] font-dm-sans"
      >
        {title}
        {isOpen ? (
          <ChevronDownIcon size={16} strokeWidth={1.3} />
        ) : (
          <ChevronRightIcon size={16} strokeWidth={1.3} />
        )}
      </button>

      {/* CSS-only grid-rows trick: no JS height measurement, so it
          never stutters/lags when toggled quickly */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <ul className="overflow-hidden">
          {items.map((item) => (
            <li key={item} className={isOpen ? "pb-0" : ""}>
              <a
                href="#collection"
                className="block py-1 text-[15px] text-[#8A8A8A] transition duration-200 hover:text-white font-dm-sans"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
