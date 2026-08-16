"use client";
import { CheckCircle2Icon, InboxIcon, PackageCheckIcon, PackageIcon, ShoppingCartIcon, TruckIcon, BoxIcon, XCircleIcon } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { STATUS_META } from "@/utils/orderFlow";
interface OrderStatCardsProps {
  orders: Order[];
  activeStatus: OrderStatus | 'all';
  onSelectStatus: (status: OrderStatus | 'all') => void;
}
interface StageCard {
  status: OrderStatus;
  icon: typeof BoxIcon;
  tone: string;
  caption: string;
}
const STAGE_CARDS: StageCard[] = [{
  status: 'placed',
  icon: InboxIcon,
  tone: 'bg-slate-100 text-slate-600',
  caption: 'Needs review'
}, {
  status: 'confirmed',
  icon: CheckCircle2Icon,
  tone: 'bg-blue-50 text-blue-600',
  caption: 'Ready to pack'
}, {
  status: 'processed',
  icon: PackageIcon,
  tone: 'bg-indigo-50 text-indigo-600',
  caption: 'Awaiting pickup'
}, {
  status: 'on_the_way',
  icon: TruckIcon,
  tone: 'bg-teal-50 text-teal-600',
  caption: 'With courier'
}, {
  status: 'delivered',
  icon: PackageCheckIcon,
  tone: 'bg-emerald-50 text-emerald-600',
  caption: 'This month'
}, {
  status: 'canceled',
  icon: XCircleIcon,
  tone: 'bg-rose-50 text-rose-600',
  caption: 'Closed'
}];
export function OrderStatCards({
  orders,
  activeStatus,
  onSelectStatus
}: OrderStatCardsProps) {
  const countOf = (status: OrderStatus) => orders.filter(order => order.status === status).length;
  return <section aria-label="Order status summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
      <article className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
        <span className="rounded-lg bg-brand-soft p-2 text-brand">
          <ShoppingCartIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-soft">Total Orders</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-ink">{orders.length}</span>
            <span className="text-xs font-medium text-emerald-600">↑14.4%</span>
          </p>
        </div>
      </article>

      {STAGE_CARDS.map(card => {
      const isActive = activeStatus === card.status;
      return <button key={card.status} type="button" aria-pressed={isActive} onClick={() => onSelectStatus(isActive ? 'all' : card.status)} className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3.5 text-left shadow-card transition-colors duration-150 ${isActive ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-slate-300'}`}>
            <span className={`rounded-lg p-2 ${card.tone}`}>
              <card.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-soft">
                {STATUS_META[card.status].label}
              </p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-ink">{countOf(card.status)}</span>
                <span className="truncate text-xs text-ink-muted">{card.caption}</span>
              </p>
            </div>
          </button>;
    })}
    </section>;
}