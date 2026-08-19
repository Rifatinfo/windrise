"use client";
import { EyeIcon, FileTextIcon, InboxIcon, PencilIcon, SearchIcon } from 'lucide-react'

import type { AfterSalesStatus, Order, OrderStatus, ShipmentStatus } from '@/types/order'
import { formatBdt, formatDate, itemCount, orderTotal } from '@/utils/format'
import { getPaymentMethodDisplay, PAYMENT_STATE_META, STATUS_META } from '@/utils/orderFlow'
import { StatusUpdateMenu } from './StatusUpdateMenu'
import { ShipmentStatusMenu } from './ShipmentStatusMenu'
import { AfterSalesMenu } from './AfterSalesMenu'


export type OrderTab = 'all' | 'placed' | 'processed' | 'on_the_way' | 'delivered'

const TABS: { value: OrderTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'processed', label: 'Processed' },
  { value: 'on_the_way', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' },
]

interface OrdersTableProps {
  orders: Order[]
  totalCount: number
  tab: OrderTab
  onTabChange: (tab: OrderTab) => void
  query: string
  onQueryChange: (value: string) => void
  onView: (order: Order) => void
  onEdit: (order: Order) => void
  onStatusChange: (id: string, status: OrderStatus) => void
  onShipmentChange: (id: string, status: ShipmentStatus) => void
  onAfterSalesChange: (id: string, status: AfterSalesStatus) => void
}

export function OrdersTable({
  orders,
  totalCount,
  tab,
  onTabChange,
  query,
  onQueryChange,
  onView,
  onEdit,
  onStatusChange,
  onShipmentChange,
  onAfterSalesChange,
}: OrdersTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <h2 className="text-base font-semibold text-ink">All Orders</h2>

        <div
          role="tablist"
          aria-label="Filter orders by stage"
          className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          {TABS.map((item) => {
            const isActive = tab === item.value
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(item.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-surface text-ink shadow-card'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search orders"
            aria-label="Search orders by ID, customer or phone"
            className="h-9 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors duration-150 focus:border-brand focus:bg-surface"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              <th scope="col" className="px-5 py-3">
                Serial
              </th>
              <th scope="col" className="px-3 py-3">
                Order
              </th>
              <th scope="col" className="px-3 py-3">
                Customer
              </th>
              <th scope="col" className="px-3 py-3">
                Items
              </th>
              <th scope="col" className="px-3 py-3">
                Total
              </th>
              <th scope="col" className="px-3 py-3">
                Payment
              </th>
              <th scope="col" className="px-3 py-3">
                Order Status
              </th>
              <th scope="col" className="px-3 py-3">
                Shipment
              </th>
              <th scope="col" className="px-3 py-3">
                After-Sales
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const method = getPaymentMethodDisplay(order.payment.method, order.payment.gateway)
              const state = PAYMENT_STATE_META[order.payment.state]

              return (
                <tr
                  key={order.id}
                  className="border-b border-line align-middle transition-colors duration-150 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 text-sm tabular-nums text-ink-soft">{order.serial}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.image}
                        alt={`${order.items[0]?.name ?? 'Product'} from order ${order.orderNo}`}
                        className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => onView(order)}
                          className="text-sm font-semibold tabular-nums text-brand transition-colors duration-150 hover:text-blue-800"
                        >
                          #{order.orderNo}
                        </button>
                        <p className="text-xs text-ink-soft">{formatDate(order.placedAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-ink">{order.customer.name}</p>
                    <p className="text-xs tabular-nums text-ink-soft">{order.customer.phone}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-ink-muted">{itemCount(order)} items</td>
                  <td className="px-3 py-3 text-sm font-semibold tabular-nums text-ink">
                    {formatBdt(orderTotal(order))}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${method.chip}`}
                      >
                        {method.short}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${state.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />
                        {state.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {order.payment.reference}
                    </p>
                  </td>
                  <td className="px-2 py-3">
                    <StatusUpdateMenu
                      status={order.status}
                      onChange={(status) => onStatusChange(order.id, status)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <ShipmentStatusMenu
                      status={order.shipment}
                      onChange={(status) => onShipmentChange(order.id, status)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <AfterSalesMenu
                      status={order.afterSales}
                      orderStatus={order.status}
                      onChange={(status) => onAfterSalesChange(order.id, status)}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(order)}
                        aria-label={`View order ${order.orderNo}`}
                        className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink"
                      >
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        aria-label={`Edit information for order ${order.orderNo}`}
                        className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink"
                      >
                        <PencilIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={!order.invoiceUrl}
                        onClick={() => order.invoiceUrl && window.open(order.invoiceUrl, "_blank")}
                        aria-label={`Invoice for order ${order.orderNo}`}
                        className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink disabled:opacity-40"
                      >
                        <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <InboxIcon className="h-6 w-6 text-ink-soft" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">No orders match this view</p>
          <p className="text-xs text-ink-muted">Clear the search or switch back to All.</p>
        </div>
      ) : (
        <p className="px-5 py-3 text-xs text-ink-soft">
          Showing {orders.length} of {totalCount} orders
          {tab !== 'all' && ` · ${STATUS_META[tab as OrderStatus].label} only`}
        </p>
      )}
    </section>
  )
}
