
'use client';

import { MODELS } from "./data/model";
import { ringOffset } from "./data/slide";


interface MobileLookbookProps {
  active: number
  onSelect: (index: number) => void
}

interface MobileSlot {
  left: string
  bottom: string
  width: string
  height: string
  zIndex: number
}

const mobileSlots: Record<number, MobileSlot> = {
  // `left` is each figure's visual centre. The proportions deliberately keep
  // the campaign block to roughly 55% of the section: one lead look, two front
  // framing looks at ~68% of its height, then two smaller raised rear looks.
  '-2': { left: '13%', bottom: '2%', width: '41%', height: '82%', zIndex: 40 },
  '-1': { left: '30%', bottom: '17%', width: '42%', height: '46%', zIndex: 30 },
  '0': { left: '50%', bottom: '-10%', width: '71%', height: '100%', zIndex: 60 },
  '1': { left: '69%', bottom: '17%', width: '52%', height: '46%', zIndex: 30 },
  '2': { left: '86%', bottom: '2%', width: '71%', height: '72%', zIndex: 40 },
}

const fallbackImages = [
  'https://cdn.magicpatterns.com/patterns/generated-images/9b2f9be1-0837-44ef-90bb-8d53585e6436.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/c5b22d5d-8e04-4a76-8d7d-b2fb3665d848.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/67a56d64-44c4-4733-a089-7235cbc0b840.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/51a591d6-0af1-4979-a7db-d20dc4ace288.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/041b240e-f8a0-4c10-a800-bd7aabcfda90.jpg',
]

/**
 * Direct five-image composition for narrow viewports. The fixed canvas height
 * is intentional: every absolute-positioned model has a real mobile stage.
 */
export function MobileLookbook({ active, onSelect }: MobileLookbookProps) {
  return (
    <div className="relative w-full aspect-[1.08/1] max-h-[350px] min-h-[320px] overflow-visible" aria-live="polite">
      {MODELS.map((model, index) => {
        const distance = ringOffset(index, active, MODELS.length)
        const slot = mobileSlots[distance] ?? mobileSlots[distance < 0 ? -2 : 2]
        const isActive = distance === 0

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`View ${model.name}`}
            aria-current={isActive ? 'true' : undefined}
            className="absolute flex -translate-x-1/2 cursor-pointer items-end justify-center border-0 bg-transparent p-0 outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-beige focus-visible:ring-offset-2"
            style={slot}
          >
            <img
              src={model.image}
              alt={model.name}
              draggable={false}
              loading="eager"
              className="pointer-events-none block h-full w-full select-none object-contain object-bottom"
              onError={(event) => {
                const image = event.currentTarget
                if (image.src !== fallbackImages[index]) image.src = fallbackImages[index]
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

