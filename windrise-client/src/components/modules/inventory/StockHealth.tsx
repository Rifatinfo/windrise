"use client";
import  { useState } from 'react'
import { PeriodSelect } from './PeriodSelect';
import type { HealthSlice } from './inventory.utils'

const SIZE = 148
const THICKNESS = 26
const RADIUS = (SIZE - THICKNESS) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function StockHealth({ data, totalSkus }: { data: HealthSlice[]; totalSkus: number }) {
  const [period, setPeriod] = useState('This Month')

  // Precompute each segment's dash and rotation so the JSX stays mutation-free
  const segments = []
  let offset = 0
  for (const slice of data) {
    segments.push({
      slice,
      dash: (slice.percent / 100) * CIRCUMFERENCE,
      rotation: -90 + (offset / 100) * 360,
    })
    offset += slice.percent
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card" aria-labelledby="stock-health">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="stock-health" className="text-[17px] font-bold tracking-tight text-ink">
            Stock Health
          </h2>
          <p className="mt-0.5 text-[13px] text-subtle">Across {totalSkus.toLocaleString('en-US')} SKUs</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} label="Change period for stock health" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-8">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Stock health breakdown">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#eceff5" strokeWidth={THICKNESS} />
          {segments.map(({ slice, dash, rotation }) => (
            <circle
              key={slice.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={THICKNESS}
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
        </svg>

        <ul className="space-y-3">
          {data.map((slice) => (
            <li key={slice.label} className="flex items-center gap-8">
              <span className="flex min-w-[120px] items-center gap-2.5 text-sm text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.label}
              </span>
              <span className="text-sm font-semibold tabular text-ink">{slice.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
