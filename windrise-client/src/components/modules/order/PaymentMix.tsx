

"use client";
import React, { useMemo } from 'react'
import { TrendingUpIcon, WalletIcon } from 'lucide-react'
import type { Order } from '@/types/order'
import { formatBdt, orderTotal, percent } from '@/utils/format'
import {
  gatewayChannelName,
  getGatewayColorMeta,
  getPaymentMethodDisplay,
  PAYMENT_METHOD_META,
} from '@/utils/orderFlow'

interface PaymentMixProps {
  orders: Order[]
}

interface MixRow {
  key: string
  label: string
  short: string
  chip: string
  bar: string
  color: string
  amount: number
  orders: number
  unsettled: number
}

export function PaymentMix({ orders }: PaymentMixProps) {
  const rows = useMemo<MixRow[]>(() => {
    const map = new Map<string, MixRow>()
    orders.forEach((order) => {
      const isCod = order.payment.method === 'cod'
      const display = getPaymentMethodDisplay(order.payment.method, order.payment.gateway)
      const key = isCod ? 'cod' : (gatewayChannelName(display.label) ?? 'Bank')
      const color = isCod ? PAYMENT_METHOD_META.cod : getGatewayColorMeta(key)

      const current =
        map.get(key) ??
        ({
          key,
          label: isCod ? 'Cash on Delivery' : key,
          short: isCod ? 'COD' : key,
          chip: color.chip,
          bar: color.bar,
          color: color.color,
          amount: 0,
          orders: 0,
          unsettled: 0,
        } as MixRow)
      current.amount += orderTotal(order)
      current.orders += 1
      if (order.payment.state !== 'paid') current.unsettled += 1
      map.set(key, current)
    })
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [orders])

  const booked = rows.reduce((sum, row) => sum + row.amount, 0)
  const settled = orders
    .filter((order) => order.payment.state === 'paid')
    .reduce((sum, order) => sum + orderTotal(order), 0)
  const outstanding = booked - settled
  const top = rows[0]
  const avgOrder = orders.length ? booked / orders.length : 0
  return (
    <section
      aria-label="Payment mix"
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-line p-5 lg:col-span-4 lg:border-r">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            <WalletIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Money Booked
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{formatBdt(booked)}</p>
          <p className="mt-1 text-xs text-ink-muted">
            Across {orders.length} orders · {formatBdt(avgOrder)} average basket
          </p>

          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <span
              className="h-full bg-emerald-500"
              style={{ width: `${percent(settled, booked)}%` }}
            />
            <span
              className="h-full bg-amber-400"
              style={{ width: `${percent(outstanding, booked)}%` }}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 px-3 py-2">
              <dt className="text-[11px] font-medium text-emerald-700">Settled</dt>
              <dd className="text-sm font-semibold text-emerald-800">{formatBdt(settled)}</dd>
              <dd className="text-[11px] text-emerald-700">{percent(settled, booked)}% of value</dd>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <dt className="text-[11px] font-medium text-amber-700">Outstanding</dt>
              <dd className="text-sm font-semibold text-amber-800">{formatBdt(outstanding)}</dd>
              <dd className="text-[11px] text-amber-700">
                {percent(outstanding, booked)}% to collect
              </dd>
            </div>
          </dl>

          {top && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-muted">
              <TrendingUpIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">
                  {top.label}
                </span>{' '}
                leads with {percent(top.amount, booked)}% of all revenue.
              </span>
            </p>
          )}
        </div>

        <div className="p-5 lg:col-span-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">How customers are paying</h2>
            <span className="text-xs text-ink-soft">Share of value</span>
          </div>

          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            {rows.map((row) => {
              const share = percent(row.amount, booked)
              return (
                <li key={row.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${row.chip}`}
                      >
                        {row.short}
                      </span>
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {formatBdt(row.amount)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(share, 4)}%`, backgroundColor: row.color }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {share}% share · {row.orders} order{row.orders === 1 ? '' : 's'}
                    {row.unsettled > 0 && (
                      <span className="text-amber-700"> · {row.unsettled} unsettled</span>
                    )}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
