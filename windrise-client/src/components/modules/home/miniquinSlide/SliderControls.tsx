import Image from "next/image";

interface SliderControlsProps {
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The artwork is the whole control — gradient disc and chevron in one 33x33
 * PNG — so the button carries no background of its own. Drawing the CSS disc
 * as well would show a second circle behind the image.
 */
const CONTROLS = [
  {
    key: "prev",
    src: "/assets/Left.png",
    label: "Previous model",
    title: "Previous look",
    side: "left-[4%] sm:left-[10%]",
  },
  {
    key: "next",
    src: "/assets/Right.png",
    label: "Next model",
    title: "Next look",
    side: "right-[4%] sm:right-[10%]",
  },
] as const;

export function SliderControls({ onPrev, onNext }: SliderControlsProps) {
  const base =
    "group absolute top-1/2 -translate-y-1/2 z-[200] flex h-[38px] w-[38px] items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E3DFD6] sm:h-[33px] sm:w-[33px]";

  return (
    <>
      {CONTROLS.map((control) => (
        <button
          key={control.key}
          type="button"
          onClick={control.key === "prev" ? onPrev : onNext}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={control.label}
          title={control.title}
          className={`${base} ${control.side}`}
        >
          <Image
            src={control.src}
            alt=""
            aria-hidden="true"
            width={33}
            height={33}
            className="pointer-events-none h-full w-full select-none"
          />
        </button>
      ))}
    </>
  );
}
