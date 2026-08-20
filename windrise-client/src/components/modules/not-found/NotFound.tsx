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
        background: 'linear-gradient(180deg, #7872AF 0%, #FFFFFF 100%)',
      }}
    >
      {/* Single cloud image traversing left to right, forever */}
      <CloudDrift src={CLOUD_SRC} duration={120} height="85%" />

      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center gap-7 px-5 py-10 sm:gap-9 sm:px-8 lg:gap-11 lg:py-14">
        {/* 404 with the character standing in front */}
        <div className="relative w-full max-w-[340px] sm:max-w-[560px] lg:max-w-[780px]">
          <img
            src={NUMBER_SRC}
            alt="404"
            className=" h-[450px] w-full select-none object-contain"
            draggable={false}
          />

          {/* Sized off the artwork's own height so it keeps its proportion to
              the digits at every breakpoint instead of using its natural size. */}
          <img
            src={CHARACTER_SRC}
            alt="A puzzled character scratching its head"
            className="absolute bottom-[-4%] left-1/2 h-[108%] w-auto max-w-none -translate-x-1/2 select-none object-contain"
            draggable={false}
          />
        </div>

        {/* Copy */}
        <motion.div
          className="flex w-full max-w-[600px] flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.4, staggerChildren: 0.12 } },
          }}
        >
          <motion.h1
            className="text-balance text-[22px] font-medium leading-tight text-neutral-900 sm:text-[30px] lg:text-[38px]"
            variants={rise}
          >
            Oops, I think we are lost!
          </motion.h1>

          <motion.p
            className="mt-2 text-pretty text-[14px] font-medium leading-[21px] tracking-[-0.02em] text-neutral-700 sm:text-[16px] sm:leading-[24px] lg:text-[18px] lg:leading-[27px]"
            variants={rise}
          >
            Let&rsquo;s get you back to somewhere familiar...
          </motion.p>

          <motion.div className="mt-5 sm:mt-6 lg:mt-7" variants={rise}>
            <BackToHomeButton onClick={onBackHome} />
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
