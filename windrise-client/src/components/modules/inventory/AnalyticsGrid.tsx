"use client";

import { motion } from 'framer-motion'
import { ClockIcon, DollarSignIcon, LineChartIcon, RepeatIcon } from 'lucide-react'
import { DonutRing } from './DonutRing';
import { cardRise, type AnalyticsCard } from './inventory.utils'


const iconMap = {
  currency: DollarSignIcon,
  trend: LineChartIcon,
  cycle: RepeatIcon,
  clock: ClockIcon,
} as const

const accentMap = {
  violet: { chip: 'bg-brand text-white shadow-lg shadow-brand/30', ring: '#5b5bf5', wash: 'from-brand/20', washDeep: 'from-brand/40' },
  blue: { chip: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30', ring: '#2563eb', wash: 'from-blue-500/20', washDeep: 'from-blue-500/40' },
  teal: { chip: 'bg-teal-600 text-white shadow-lg shadow-teal-600/30', ring: '#0d9488', wash: 'from-teal-500/20', washDeep: 'from-teal-500/40' },
  red: { chip: 'bg-red-500 text-white shadow-lg shadow-red-500/30', ring: '#e5484d', wash: 'from-red-500/20', washDeep: 'from-red-500/40' },
} as const

const badgeMap = {
  good: 'bg-green-50 text-good',
  teal: 'bg-teal-50 text-teal-600',
  bad: 'bg-red-50 text-bad',
} as const

export function AnalyticsGrid({ cards }: { cards: AnalyticsCard[] }) {
  return (
    <section aria-labelledby="business-analytics">
      <h2 id="business-analytics" className="text-[17px] font-bold tracking-tight text-ink">
        Business Analytics
      </h2>
      <p className="mt-0.5 text-sm text-subtle">The numbers that matter most for inventory decisions right now</p>

      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = iconMap[card.icon]
          const accent = accentMap[card.accent]
          return (
            <motion.li
              key={card.id}
              variants={cardRise}
              className={`relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-gradient-to-b ${accent.wash} to-transparent`}
                aria-hidden="true"
              />
              <div
                className={`pointer-events-none absolute -right-4 -top-10 h-28 w-28 rounded-full bg-gradient-to-b ${accent.washDeep} to-transparent`}
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.chip}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <DonutRing percent={card.ringPercent} color={accent.ring} label={card.ringLabel} />
              </div>

              <p className="relative mt-6 text-sm text-slate-500">{card.label}</p>
              <p className="relative mt-1 flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold leading-tight tabular text-ink">{card.value}</span>
                {card.suffix && <span className="text-sm font-semibold text-subtle">{card.suffix}</span>}
              </p>

              <p className="relative mt-2.5 text-[13px] leading-relaxed text-subtle">{card.detail}</p>

              <div className="relative mt-auto flex items-end justify-between gap-3 pt-4">
                <span
                  className={`text-[13px] font-semibold ${card.trendTone === 'good' ? 'text-good' : 'text-bad'}`}
                >
                  {card.trend}
                </span>
                {card.badge && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeMap[card.badge.tone]}`}
                  >
                    {card.badge.text}
                  </span>
                )}
                {card.footnote && <span className="text-xs text-subtle">{card.footnote}</span>}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
