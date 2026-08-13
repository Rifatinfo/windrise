"use client";
import { motion } from 'framer-motion'
import { BoxIcon, CircleCheckBigIcon, CircleXIcon, TriangleAlertIcon } from 'lucide-react'
import { cardRise, type Kpi } from './inventory.utils'


const iconMap = {
  box: BoxIcon,
  alert: TriangleAlertIcon,
  x: CircleXIcon,
  check: CircleCheckBigIcon,
} as const

const toneMap = {
  good: { chip: 'bg-brand/10 text-brand', delta: 'text-good' },
  warn: { chip: 'bg-amber-50 text-warn', delta: 'text-warn' },
  bad: { chip: 'bg-red-50 text-bad', delta: 'text-bad' },
  muted: { chip: 'bg-teal-50 text-teal-600', delta: 'text-subtle' },
} as const

export function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon]
        const tone = toneMap[kpi.tone]
        return (
          <motion.li
            key={kpi.id}
            variants={cardRise}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] text-subtle">{kpi.label}</p>
              <p className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl font-bold tabular text-ink">{kpi.value}</span>
                <span className={`text-xs font-semibold ${tone.delta}`}>{kpi.delta}</span>
              </p>
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}
