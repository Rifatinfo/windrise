"use client";

const steps = ['SHOPPING BAG', 'CHECKOUT', 'COMPLETE ORDER']

type StepperProps = {
  current: 1 | 2 | 3
}

export function Stepper({ current }: StepperProps) {
  return (
    <nav aria-label="Checkout progress" className="flex items-center justify-center">
      <ol className="flex items-center gap-x-6 sm:gap-x-10 md:gap-x-14">
        {steps.map((label, index) => {
          const step = index + 1
          const isActive = step === current
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-3">
              <span
                aria-hidden="true"
                className={[
                  'flex h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full text-[11px] sm:text-xs md:text-sm',
                  isActive ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-[#8a8a8a]',
                ].join(' ')}
              >
                {step}
              </span>
              <span
                className={[
                  'text-[8px] sm:text-[10px] md:text-[11px] tracking-[0.08em] whitespace-nowrap',
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
