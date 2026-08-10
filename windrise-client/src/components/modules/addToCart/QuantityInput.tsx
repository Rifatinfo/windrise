
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'

type QuantityInputProps = {
  value: number
  onChange: (value: number) => void
  label: string
}

export function QuantityInput({ value, onChange, label }: QuantityInputProps) {
  return (
    <div className="inline-flex h-[26px] w-[46px] items-center justify-between border border-[#dcdcdc] pl-2 pr-1">
      <span className="text-[11px] leading-none text-[#1a1a1a]">{value}</span>
      <span className="flex flex-col">
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase quantity of ${label}`}
          className="text-[#8a8a8a] transition-colors hover:text-[#1a1a1a]"
        >
          <ChevronUpIcon className="h-[10px] w-[10px]" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label={`Decrease quantity of ${label}`}
          className="text-[#8a8a8a] transition-colors hover:text-[#1a1a1a]"
        >
          <ChevronDownIcon className="h-[10px] w-[10px]" strokeWidth={1.5} />
        </button>
      </span>
    </div>
  )
}
