"use client";
import { ChevronRightIcon } from 'lucide-react'
import { LoopingShort } from './LoopingShort';


const VIDEO_SRC =
  'https://res.cloudinary.com/mmm82s98/video/upload/v1786365064/WR_Walking_Loop_2.mp4'

export function RhythmSection() {
  return (
    <section
      // No horizontal padding on phones: the editorial image runs full bleed
      // there, and the copy column below carries its own inset instead. The
      // desktop padding is untouched.
      className="w-full bg-warmwhite px-0 py-4 md:pl-0 md:pr-46 md:py-14 md:mb-10 mb-2"
      aria-labelledby="rhythm-heading"
    >
      <div className="mx-auto flex  w-full max-w-[1720px] flex-col gap-10 md:flex-row md:items-end md:gap-12">
        {/* Left: editorial image */}
        <figure className="relative m-0 w-full max-w-none md:max-w-[1190px] md:flex-[1_1_1190px]">
          <div className="relative h-[317px]  w-full overflow-hidden md:h-[980px]">
            <img
              src="/assets/young-boy-2.png"
              alt="Model seated in an olive lounge chair wearing a relaxed sage tee, light denim and tan loafers"
              className="h-full w-full object-cover -ml-6 md:-ml-0 rounded-sm"
            />
            <div className="absolute inset-x-0 bottom-0 md:bottom-10 flex flex-col items-end  gap-3 p-5 text-left md:gap-7 md:p-14 md:mr-20 mr-10">
              <h2
                id="rhythm-heading"
                className="text-[18px]  font-normal leading-[1.2] text-white md:text-[50px]"
              >
                Defining
                <br />
                comfort in its
                <br />
                purest form.
              </h2>
              <button
                className="group inline-flex items-center gap-1 overflow-hidden bg-[#3a2b1f]/90 px-2.5 py-1.5 text-[8px]  font-medium tracking-wide text-white transition-colors hover:bg-[#3a2b1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:gap-3 md:px-10 md:py-3 md:text-[15px] md:mr-[50px]"
              >
                Discover Collection
                <ChevronRightIcon
                  className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-1.5 md:h-4 md:w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </figure>

        {/* Right: copy + video */}
        {/* Carries the inset the section no longer applies on phones. */}
        <div className="flex w-full flex-col items-start gap-6  px-6 md:w-[438px] md:flex-none md:gap-8 md:px-0">
          <div className="flex flex-col gap-4 md:gap-5">
            <h3 className="text-[22px] leading-[1.25] text-neutral-900 md:text-[40px]">
              Different <span>moments.</span>
              <br />
              One <span>rhythm.</span>
            </h3>
            <p className="text-[13px] font-normal leading-relaxed text-neutral-600 md:text-[20px]">
              From casual to refined, essentials designed to move effortlessly through every side of
              your day.
            </p>
          </div>

          <LoopingShort
            src={VIDEO_SRC}
            title="Essentials in motion — model walking in a white shirt and denim"
            // Fills the copy column's inset width on phones rather than being
            // capped narrower than the text beside it.
            className="h-[380px] w-full max-w-none md:h-[623px] md:max-w-[438px]"
          />
        </div>
      </div>
    </section>
  )
}
