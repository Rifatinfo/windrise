"use client";
import  { useState } from 'react'
import { PeriodSelect } from './PeriodSelect'
import type { CategoryStock } from './inventory.utils'


export function StockByCategory({ data }: { data: CategoryStock[] }) {
  const [period, setPeriod] = useState('This Month')
  const max = Math.max(...data.map((category) => category.units), 1)

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card" aria-labelledby="stock-by-category">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="stock-by-category" className="text-[17px] font-bold tracking-tight text-ink">
            Stock by Category
          </h2>
          <p className="mt-0.5 text-[13px] text-subtle">Units currently held across all warehouses</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} label="Change period for stock by category" />
      </div>

      <ul className="mt-5 space-y-3.5">
        {data.map((category) => (
          <li key={category.name} className="flex items-center gap-4">
            <span className="w-[92px] shrink-0 text-sm text-slate-600">{category.name}</span>
            <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-300 ease-out"
                style={{ width: `${(category.units / max) * 100}%`, backgroundColor: category.color }}
              />
            </span>
            <span className="w-[64px] shrink-0 text-right text-sm font-semibold tabular text-ink">
              {category.units.toLocaleString('en-US')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
