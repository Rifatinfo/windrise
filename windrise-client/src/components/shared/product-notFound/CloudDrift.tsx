'use client';
import { motion } from 'framer-motion'

const CLOUD_SRC = '/assets/Cloud.png'

type CloudDriftProps = {
  /** Seconds for one full traverse loop */
  duration?: number
}

/**
 * The cloud artwork drifting endlessly from left to right across the top of
 * the stage.
 *
 * Every other copy is mirrored horizontally, so the edge of one tile always
 * meets an identical edge — no visible seam, no stretched pixels. The image
 * keeps its natural proportions (object-cover) and fades out at the bottom so
 * it melts into the gradient the way real haze does.
 */
// export function CloudDrift({ duration = 120 }: CloudDriftProps) {
//   const fade =
//     'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0) 100%)'

//   return (
//     <div
//       className="pointer-events-none absolute inset-x-0 top-0 h-[78%] overflow-hidden"
//       style={{
//         WebkitMaskImage: fade,
//         maskImage: fade,
//       }}
//       aria-hidden="true"
//     >
//       <motion.div
//         className="flex h-full w-[400%]"
//         initial={{ x: '-50%' }}
//         animate={{ x: '0%' }}
//         transition={{
//           duration,
//           ease: 'linear',
//           repeat: Infinity,
//           repeatType: 'loop',
//         }}
//       >
//         {[0, 1, 2, 3].map((index) => (
//           <div key={index} className="h-full w-1/4  flex-none overflow-hidden">
//             <img
//               src={CLOUD_SRC}
//               alt=""
//               className="h-full w-full object-cover object-center"
//               style={{
//                 transform: index % 2 === 1 ? 'scaleX(-1)' : undefined,
//               }}
//               draggable={false}
//             />
//           </div>
//         ))}
//       </motion.div>
//     </div>
//   )
// }



export function CloudDrift({ duration = 120 }: CloudDriftProps) {
  const fade =
    'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.6) 78%, rgba(0,0,0,0) 100%)'

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[80%] overflow-hidden"
      style={{
        WebkitMaskImage: fade,
        maskImage: fade,
        filter: 'contrast(1.25) brightness(1.06)',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="flex h-full w-[400%]"
        initial={{ x: '-50%' }}
        animate={{ x: '0%' }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-full w-1/4 flex-none overflow-hidden">
            <img
              src={CLOUD_SRC}
              alt=""
              className="h-full w-full object-cover object-center "
              style={{
                transform: index % 2 === 1 ? 'scaleX(-1)' : undefined,
              }}
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}