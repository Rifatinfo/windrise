"use client";
import { motion } from 'framer-motion'
import { CloudDrift } from './CloudDrift';
import { BackToHomeButton } from './BackToHomeButton';


const CLOUD_SRC =
  '/assets/Cloud-Not_found.png'
const NUMBER_SRC = '/assets/404.png'
const CHARACTER_SRC =
  '/assets/Character.png'

const rise = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

type NotFoundProps = {
  onBackHome?: () => void
}

export function NotFound({ onBackHome }: NotFoundProps) {
  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #6E7A82 0%, #EDF4FF 100%)',
      }}
    >
      {/* Single cloud image traversing left to right, forever */}
      <CloudDrift src={CLOUD_SRC} duration={120} height="85%" />

      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
        {/* 404 with the character standing in front */}
        <motion.div
          className="relative w-[86%] max-w-[1000px] sm:w-[72%] lg:w-[66%]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={NUMBER_SRC}
            alt="404"
            className="h-auto w-full select-none object-contain "
            draggable={false}
          />

          <motion.img
            src={CHARACTER_SRC}
            alt="A puzzled blue character scratching its head"
            className="absolute bottom-[-22%] left-[57%] h-[119%] w-auto max-w-none -translate-x-1/2 select-none object-contain"
            draggable={false}
            initial={{ opacity: 0, y: 32 }}
            animate={{
              opacity: 1,
              y: [0, -9, 0],
              rotate: [-1.5, 1.5, -1.5],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.35 },
              y: { duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 0.35 },
              rotate: { duration: 7, ease: 'easeInOut', repeat: Infinity },
            }}
          />
        </motion.div>

        {/* Copy */}
        <motion.div
          className="mt-[14%] flex w-[86%] max-w-[1000px] flex-col items-center text-center sm:mt-[8%] sm:w-[72%] lg:mt-[7%] lg:w-[66%]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.4, staggerChildren: 0.12 } },
          }}
        >
          <motion.h1
            className="font-medium leading-tight text-[28px] text-neutral-900 sm:text-[36px] lg:text-[45px]"
            variants={rise}
          >
            Oops, I think we are lost!
          </motion.h1>

          <motion.p
            className="mt-2 max-w-xl font-medium text-[15px] leading-[22px] tracking-[-0.03em] text-neutral-700 sm:text-[18px] sm:leading-[26px] lg:text-[22px] lg:leading-[31px]"
            variants={rise}
          >
            Let’s get you back to somewhere familiar...
          </motion.p>

          <motion.div className="mt-6 sm:mt-8" variants={rise}>
            <BackToHomeButton onClick={onBackHome} />
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
