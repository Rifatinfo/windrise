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
      // The fixed `pr-46` used to come out of the image rather than the page,
      // so the picture shrank as the screen did — down to 98px on a tablet.
      // The right column now carries the inset instead.
      className="w-full bg-warmwhite px-0 py-4 mb-2 md:mb-0 md:py-0 "
      aria-labelledby="rhythm-heading "
    >
      {/*
        A centred 7xl container fixes the right edge, and the image is pulled
        back out to the viewport on the left — so the copy lines up with the
        rest of the page while the picture still runs full bleed.
      */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 md:flex-row md:items-end md:gap-12 md:pr-8 md:py-14 ">
        {/* Left: editorial image — bleeds past the container to the screen edge */}
        <figure className="relative m-0 w-full max-w-none md:min-w-0 md:flex-1 xl:ml-[calc((1280px-100vw)/2)]">
          {/* Steps with the column. A flat md:h-[980px] made the picture 388
              wide by 980 tall on a tablet — a slot, not a photograph. */}
          <div className="relative h-[317px] w-full overflow-hidden md:h-[520px] lg:h-[720px] xl:h-[980px]">
            <img
              src="/assets/young-boy-2.png"
              alt="Model seated in an olive lounge chair wearing a relaxed sage tee, light denim and tan loafers"
              className="h-full w-full object-cover -ml-6 md:-ml-0 rounded-sm"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-end gap-3 p-5 text-left mr-10 md:bottom-6 md:gap-4 md:p-8 md:mr-6 lg:bottom-8 lg:gap-6 lg:p-10 lg:mr-12 xl:bottom-10 xl:gap-7 xl:p-14 xl:mr-20">
              <h2
                id="rhythm-heading"
                className="text-[18px] font-normal leading-[1.2] text-white md:text-[26px] lg:text-[36px] xl:text-[50px]"
              >
                Defining
                <br />
                comfort in its
                <br />
                purest form.
              </h2>
              <button
                className="group inline-flex items-center gap-1 overflow-hidden bg-[#3a2b1f]/90 px-2.5 py-1.5 text-[8px]  font-medium tracking-wide text-white transition-colors hover:bg-[#3a2b1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:gap-2 md:px-5 md:py-2 md:text-[11px] lg:gap-3 lg:px-8 lg:py-2.5 lg:text-[13px] xl:px-10 xl:py-3 xl:text-[15px] xl:mr-[50px]"
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
        {/* Narrower than the old fixed 438px, and it shrinks on a tablet rather
            than holding its width while the image is squeezed to nothing. */}
        <div className="flex w-full flex-col items-start gap-6 px-6 md:w-[220px] md:flex-none md:gap-8 md:px-0 lg:w-[300px] xl:w-[400px]">
          <div className="flex flex-col gap-4 md:gap-5">
            <h3 className="text-[22px] leading-[1.25] text-neutral-900 md:text-[24px] lg:text-[30px] xl:text-[40px]">
              Different <span>moments.</span>
              <br />
              One <span>rhythm.</span>
            </h3>
            <p className="text-[13px] font-normal leading-relaxed text-neutral-600 md:text-[14px] lg:text-[16px] xl:text-[20px]">
              From casual to refined, essentials designed to move effortlessly through every side of
              your day.
            </p>
          </div>

          <LoopingShort
            src={VIDEO_SRC}
            title="Essentials in motion — model walking in a white shirt and denim"
            // Fills the copy column's inset width on phones rather than being
            // capped narrower than the text beside it.
          />
        </div>
      </div>
    </section>
  )
}
