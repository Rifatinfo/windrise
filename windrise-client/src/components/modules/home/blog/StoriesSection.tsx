"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import DetailsContactSection from "../letsConnect/DetailsContactSection";
import Link from "next/link";

const PORTRAIT_IMAGE_URL = "/assets/Image 1.png";
const FOLDED_CLOTHES_IMAGE_URL = "/assets/Image 2.png";

interface TiltState {
  rotateX: number;
  rotateY: number;
  translateX: number;
  translateY: number;
}

const RESET_TILT: TiltState = {
  rotateX: 0,
  rotateY: 0,
  translateX: 0,
  translateY: 0,
};

// Wraps an image and tracks cursor position inside it to drive a
// subtle 3D tilt + parallax shift + scale, eased with CSS transitions.
function TiltImage({
  className,
  wrapperClassName,
  ...imageProps
}: {
  className: string;
  wrapperClassName: string;
} & React.ComponentProps<typeof Image>) {
  const [tilt, setTilt] = useState<TiltState>(RESET_TILT);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 -> 1
    const py = (e.clientY - rect.top) / rect.height; // 0 -> 1

    const MAX_ROTATE = 6; // deg
    const MAX_TRANSLATE = 8; // px

    setTilt({
      rotateY: (px - 0.5) * MAX_ROTATE * 2,
      rotateX: -(py - 0.5) * MAX_ROTATE * 2,
      translateX: (px - 0.5) * MAX_TRANSLATE * 2,
      translateY: (py - 0.5) * MAX_TRANSLATE * 2,
    });
  };

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    setTilt(RESET_TILT);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`overflow-hidden [perspective:900px] ${wrapperClassName}`}
    >
      <div
        style={{
          transform: hovered
            ? `translate3d(${tilt.translateX}px, ${tilt.translateY}px, 0) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.06)`
            : `translate3d(0,0,0) rotateX(0) rotateY(0) scale(1)`,
          transition: hovered
            ? "transform 120ms ease-out"
            : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="h-full w-full"
      >
        <Image {...imageProps} className={className} />
      </div>
    </div>
  );
}

export function StoriesSection() {
  return (
    <section
      className="w-full bg-[linear-gradient(180deg,#FFFFFF_0%,#F2F4F0_95%,#FFFFFF_100%)]"
      aria-labelledby="stories-heading"
    >
      <div className="mx-auto flex flex-col px-6 py-9 md:mt-16  lg:mt-16  md:flex-row md:items-center md:justify-between md:gap-10 lg:gap-20 md:py-6 lg:py-6 lg:px-19 md:px-19 lg:ml-50 md:ml-50">
        <div className="w-full shrink-0 md:w-[36%] lg:w-[550px] lg:pr-[70px]">
          <h2
            id="stories-heading"
            className="w-full text-xl font-medium leading-[1.18]  md:text-[45px] lg:text-[45px] font-dm-sans"
          >
            Stories behind
            <br />
            every stitch.
          </h2>

          <p className="mt-6 md:mt-8 lg:mt-10 text-[14px]   text-[#616161] md:text-[25px] lg:text-[25px] font-dm-sans">
            Discover thoughtful articles on craftsmanship, styling, fabrics and
            the ideas that shape the world of Windrise.
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2  border-transparent pb-0.5 text-[13.5px] font-light text-[#1C1B1A] transition-[gap] duration-200 hover:gap-3 hover:border-[#1C1B1A] lg:text-xl mt-10"
          >
            Explore Stories
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M6 3.5L10.5 8L6 12.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className="mt-5  flex w-full min-w-0 items-start gap-2.5  sm:gap-4 md:mt-0 md:w-[64%] md:gap-4 lg:w-auto lg:flex-shrink-0 lg:gap-[36px]">
          <TiltImage
            width={424}
            height={615}
            src="/assets/Image-1.png"
            alt="Two men wearing Windrise looks against a burgundy backdrop"
            wrapperClassName="w-[48.6%] min-w-0 rounded-sm md:w-[424px] lg:w-[424px]"
            className="h-auto w-full object-cover rounded-sm"
          />
          <TiltImage
            width={416}
            height={408}
            src="/assets/Image-2.png"
            alt="Folded olive knitwear and blue denim on a leather chair"
            wrapperClassName="mt-[28px] aspect-square w-[48%] min-w-0 rounded-sm md:mt-[46px] md:w-[51%] lg:mt-[80px] lg:w-[416px]"
            className="h-full w-full object-cover rounded-sm"
          />
        </div>
      </div>

      {/* lets' connect */}
      <DetailsContactSection />
    </section>
  );
}
