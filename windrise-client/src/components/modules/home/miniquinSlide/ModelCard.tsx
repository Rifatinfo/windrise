'use client';

import { ModelItem } from "./data/model";
import { cardStyle } from "./data/slide";


interface ModelCardProps {
  model: ModelItem
  distance: number
  canvasScale: number
  isMobile: boolean
  onSelect: () => void
}

export function ModelCard({ model, distance, canvasScale, isMobile, onSelect }: ModelCardProps) {
  const { x, y, scale, zIndex } = cardStyle(distance, canvasScale, isMobile)
  const isActive = distance === 0
  const xOffset = typeof x === 'number' ? `${x}px` : x

  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={onSelect}
      aria-label={`View ${model.name}`}
      aria-current={isActive ? 'true' : undefined}
      className="absolute bottom-0 flex h-[96%] w-[82vw] cursor-pointer flex-col items-center rounded-sm border-0 bg-transparent p-0 outline-none transition-[left,transform,opacity] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-beige focus-visible:ring-offset-4 focus-visible:ring-offset-warmwhite sm:w-[500px]"
      style={{
        left: `calc(50% + ${xOffset})`,
        zIndex,
        transform: `translateX(-50%) translateY(${y}px) scale(${scale})`,
        transformOrigin: 'bottom center',
        touchAction: 'pan-y',
      }}
      title={`Make ${model.name} the featured look`}
    >
      <div className="relative flex h-full w-full items-end justify-center">
        <img
          src={model.image}
          alt={model.name}
          draggable={false}
          className="pointer-events-none block h-full max-w-full select-none object-contain object-bottom"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none -mt-2 h-5 w-[68%] rounded-[100%]" />
    </button>
  )
}
