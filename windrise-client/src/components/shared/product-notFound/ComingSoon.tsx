"use client";
import { motion } from 'framer-motion'
import { ChevronLeftIcon } from 'lucide-react'
import { CloudDrift } from './CloudDrift';


const ILLUSTRATION_SRC =
  '/assets/product-not-found.png'

type ComingSoonProps = {
  onBackHome?: () => void
}

export function ComingSoon({ onBackHome }: ComingSoonProps) {
  const handleBackHome = () => {
    if (onBackHome) {
      onBackHome()
      return
    }
    window.location.href = '/'
  }

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #6E7A82 0%, #FFFFFF 73% )',
      }}
    >
      {/* Single cloud image, pinned top, traversing left to right forever */}
      <CloudDrift duration={120} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        {/* Illustration */}
        <motion.div
          className="w-full max-w-[720px]"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src={ILLUSTRATION_SRC}
            alt="Three friendly blue characters working together at a desk in front of a whiteboard"
            className="h-auto w-full select-none object-contain"
            draggable={false}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 6,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
        </motion.div>

        {/* Copy */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.25, staggerChildren: 0.12 } },
          }}
        >
          <motion.h1
            className="font-medium leading-tight text-[28px] text-neutral-900 sm:text-[36px] lg:text-[45px]"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            Coming Soon!
          </motion.h1>

          <motion.p
            className="mt-2 max-w-xl font-medium text-[15px] leading-[22px] tracking-[-0.03em] text-neutral-700 sm:text-[18px] sm:leading-[26px] lg:text-[16px] lg:leading-[31px]"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            We’re still working on this.
            <br />
            Our team is crafting something great for you.
          </motion.p>

          <motion.div
            className="mt-6 sm:mt-8"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <motion.button
              type="button"
              onClick={handleBackHome}
              className="group inline-flex items-center gap-2 rounded-[24px] bg-neutral-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-neutral-900/15 outline-none transition-colors  cursor-pointer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <ChevronLeftIcon
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
