"use client";
import { ChevronRightIcon } from 'lucide-react'
import { LoopingShort } from './LoopingShort';


const VIDEO_SRC =
  'https://res.cloudinary.com/mmm82s98/video/upload/v1786365064/WR_Walking_Loop_2.mp4'

export function RhythmSection() {
  return (
    <section
      className="w-full bg-warmwhite px-4 py-8 md:pl-0 md:pr-46 md:py-14 mb-10"
      aria-labelledby="rhythm-heading"
    >
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-8 md:flex-row md:items-end md:gap-12">
        {/* Left: editorial image */}
        <figure className="relative m-0 w-full max-w-[350px] md:max-w-[1190px] md:flex-[1_1_1190px]">
          <div className="relative h-[317px] w-full overflow-hidden md:h-[980px]">
            <img
              src="/assets/young-boy-2.png"
              alt="Model seated in an olive lounge chair wearing a relaxed sage tee, light denim and tan loafers"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-end gap-3 p-5 text-right md:gap-7 md:p-14">
              <h2
                id="rhythm-heading"
                className="text-[18px] font-normal leading-[1.2] text-white md:text-[55px]"
              >
                Defining
                <br />
                comfort in its
                <br />
                purest form.
              </h2>
              <a
                href="#collection"
                className="group inline-flex items-center gap-2 overflow-hidden bg-[#3a2b1f]/90 px-3 py-1.5 text-[9px] font-medium tracking-wide text-white transition-colors hover:bg-[#3a2b1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:gap-3 md:px-7 md:py-4 md:text-[15px]"
              >
                Discover Collection
                <ChevronRightIcon
                  className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-1.5 md:h-4 md:w-4"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </figure>

        {/* Right: copy + video */}
        <div className="flex w-full flex-col items-start gap-5 md:w-[438px] md:flex-none md:gap-8 md:pt-16">
          <div className="flex flex-col gap-3 md:gap-5">
            <h3 className="text-[22px] font-light leading-[1.25] text-neutral-900 md:text-[40px]">
              Different <span className="font-semibold">moments.</span>
              <br />
              One <span className="font-semibold">rhythm.</span>
            </h3>
            <p className="text-[13px] font-normal leading-relaxed text-neutral-600 md:text-[20px]">
              From casual to refined, essentials designed to move effortlessly through every side of
              your day.
            </p>
          </div>

          <LoopingShort
            src={VIDEO_SRC}
            title="Essentials in motion — model walking in a white shirt and denim"
            className="h-[559px] w-full max-w-[323px] md:h-[623px] md:max-w-[438px]"
          />
        </div>
      </div>
    </section>
  )
}
