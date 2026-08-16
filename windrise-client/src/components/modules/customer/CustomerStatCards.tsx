"use client";
import {
  UserCheck2Icon,
  UserRoundIcon,
  UserRoundXIcon,
  UsersIcon,
  WalletCardsIcon,
} from "lucide-react";
import type { Customer, UserStatus } from "@/types/customer";
import { formatBdt } from "@/utils/format";

export type StatusFilter = UserStatus | "all";

interface CustomerStatCardsProps {
  customers: Customer[];
  totalSpent: number;
  activeStatus: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
}

export function CustomerStatCards({
  customers,
  totalSpent,
  activeStatus,
  onSelectStatus,
}: CustomerStatCardsProps) {
  const countOf = (status: UserStatus) =>
    customers.filter((customer) => customer.status === status).length;

  const statusCards: { status: UserStatus; icon: typeof UsersIcon; tone: string; caption: string }[] = [
    {
      status: "ACTIVE",
      icon: UserCheck2Icon,
      tone: "bg-emerald-50 text-emerald-600",
      caption: "Current accounts",
    },
    {
      status: "INACTIVE",
      icon: UserRoundIcon,
      tone: "bg-amber-50 text-amber-600",
      caption: "Dormant accounts",
    },
    {
      status: "DELETED",
      icon: UserRoundXIcon,
      tone: "bg-rose-50 text-rose-600",
      caption: "Closed accounts",
    },
  ];

  return (
    <section
      aria-label="Customer summary"
      className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
    >
      <article className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
        <span className="rounded-lg bg-brand-soft p-2 text-brand">
          <UsersIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-soft">Total Customers</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">{customers.length}</p>
        </div>
      </article>

      {statusCards.map((card) => {
        const isActive = activeStatus === card.status;
        return (
          <button
            key={card.status}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectStatus(isActive ? "all" : card.status)}
            className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3.5 text-left shadow-card transition-colors duration-150 ${
              isActive ? "border-brand ring-1 ring-brand" : "border-line hover:border-slate-300"
            }`}
          >
            <span className={`rounded-lg p-2 ${card.tone}`}>
              <card.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-soft">{card.caption}</p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-ink">{countOf(card.status)}</span>
                <span className="truncate text-xs text-ink-muted">
                  {card.status.charAt(0) + card.status.slice(1).toLowerCase()}
                </span>
              </p>
            </div>
          </button>
        );
      })}

      <article className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
        <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
          <WalletCardsIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-soft">Total Spent</p>
          <p className="mt-0.5 truncate text-xl font-semibold text-ink">
            {formatBdt(totalSpent)}
          </p>
        </div>
      </article>
    </section>
  );
}
