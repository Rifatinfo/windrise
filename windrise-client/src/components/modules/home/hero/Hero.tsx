
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const HERO_IMAGE = "/assets/hero-1.png";
const HERO_IMAGE2 = "/assets/hero-2.png";
const HERO_IMAGE3 = "/assets/hero-3.png";

const SLIDE_IMAGES = [HERO_IMAGE, HERO_IMAGE2, HERO_IMAGE3];
const SLIDE_ALTS = [
  "Model wearing striped shirt seated on a stone bench surrounded by greenery and white roses",
  "Hero slide 2",
  "Hero slide 3",
];
const SLIDE_POSITIONS = ["50% center", "42% center", "58% center"];

const TOTAL_SLIDES = SLIDE_IMAGES.length;
const SLIDE_DURATION_MS = 9000;
const DRAG_THRESHOLD_PERCENT = 15; // % of hero width the mouse/finger must travel to change slide

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // live px offset while dragging
  const [isPointerDown, setIsPointerDown] = useState(false);

  const pointerStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPointerDown) return; // pause autoplay while user is dragging
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % TOTAL_SLIDES);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(intervalId);
  }, [activeSlide, isPointerDown]);

  const goToSlide = (index: number) => {
    setActiveSlide(((index % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPointerDown(true);
    pointerStartX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return;
    setDragOffset(e.clientX - pointerStartX.current);
  };

  const finishDrag = () => {
    const width = trackRef.current?.offsetWidth || 1;
    const percentMoved = (dragOffset / width) * 100;

    if (percentMoved > DRAG_THRESHOLD_PERCENT) {
      goToSlide(activeSlide - 1); // dragged right -> previous slide
    } else if (percentMoved < -DRAG_THRESHOLD_PERCENT) {
      goToSlide(activeSlide + 1); // dragged left -> next slide
    }
    setDragOffset(0);
    setIsPointerDown(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return;
    finishDrag();
  };

  return (
    <section
      className="relative w-full h-screen min-h-[560px] overflow-hidden bg-black select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "pan-y" }}
    >
      {/* Background image track */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full w-full"
          style={{
            transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))`,
            transition: isPointerDown
              ? "none"
              : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {SLIDE_IMAGES.map((src, i) => (
            <div key={src} className="relative h-full w-full flex-shrink-0">
              <Image
                src={src}
                alt={SLIDE_ALTS[i]}
                fill
                priority={i === 0}
                draggable={false}
                className="object-cover"
                style={{ objectPosition: SLIDE_POSITIONS[i] }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle overlay to keep text legible */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent"
        aria-hidden="true"
      />

      {/* Header */}

      {/* Hero text content */}
      <div className="relative z-10 flex h-[calc(100%-76px)] items-center">
        <div className="w-full px-6 lg:px-20 md:px-20">
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold leading-[0.95] bg-gradient-to-b from-[#E6E1CB] to-[#E6E1CB] bg-clip-text text-transparent lg:text-6xl font-avegreat">
              Quiet Luxury,
              <br />
              Naturally.
            </h1>
            <p className="mt-6 lg:max-w-md text-[14px] md:text-xl lg:text-[23px] leading-relaxed text-[#FFFFFF]">
              Modern essentials inspired by movement, simplicity and everyday
              elegance.
            </p>
            <button className="mt-7 rounded-md bg-white px-14 md:px-20 py-1.5 md:py-1.5 text-[16px] font-medium font-dam-sans text-black shadow-[0_0_18px_4px_rgba(255,255,255,0.5)] transition-all hover:bg-white hover:shadow-[0_0_26px_7px_rgba(255,255,255,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
       
         <div
        className="absolute bottom-6 md:bottom-14  left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 lg:left-auto lg:right-18 lg:translate-x-0"
        role="tablist"
        aria-label="Hero slides"
        >
        {Array.from({
          length: TOTAL_SLIDES,
        }).map((_, i) => {
          const isActive = activeSlide === i;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActiveSlide(i)}
              className={`rounded-full border border-white/40 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isActive ? "h-2 w-2 border-white bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)]" : "h-1 w-1 bg-white/35 hover:bg-white/70"}`}
            />
          );
        })}
      </div>
    </section>
  );
}

