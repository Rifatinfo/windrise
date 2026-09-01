"use client";

const steps = ['SHOPPING BAG', 'CHECKOUT', 'COMPLETE ORDER']

type StepperProps = {
  current: 1 | 2 | 3
}

export function Stepper({ current }: StepperProps) {
  return (
    <nav aria-label="Checkout progress" className="flex w-full items-center justify-center">
      {/* On phones the row spans the container and shares out the space, so
          "COMPLETE ORDER" cannot spill past the edge. From sm up it goes back
          to a centred row with fixed gaps. */}
      <ol className="flex w-full items-center justify-between gap-x-2 sm:w-auto sm:justify-center sm:gap-x-10 md:gap-x-14">
        {steps.map((label, index) => {
          const step = index + 1
          const isActive = step === current
          return (
            <li key={label} className="flex items-center gap-1.5 sm:gap-3">
              <span
                aria-hidden="true"
                className={[
                  'flex h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs md:text-sm',
                  isActive ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-[#8a8a8a]',
                ].join(' ')}
              >
                {step}
              </span>
              <span
                className={[
                  'text-[7px] sm:text-[10px] md:text-[11px] tracking-[0.08em] whitespace-nowrap',
                  isActive ? 'text-[#1a1a1a]' : 'text-[#6f6f6f]',
                ].join(' ')}
                aria-current={isActive ? 'step' : undefined}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
