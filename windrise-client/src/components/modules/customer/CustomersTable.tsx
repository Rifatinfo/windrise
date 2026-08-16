"use client";
import {
  EyeIcon,
  InboxIcon,
  MailIcon,
  SearchIcon,
  ShoppingBagIcon,
} from "lucide-react";
import type {
  Customer,
  CustomerStats,
} from "@/types/customer";
import {
  customerTier,
  CUSTOMER_TIER_META,
  USER_STATUS_META,
} from "@/types/customer";
import { formatBdt } from "@/utils/format";
import type { StatusFilter } from "./CustomerStatCards";
import { CustomerAvatar } from "./CustomerAvatar";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DELETED", label: "Deleted" },
];

function formatDateOnly(input: string | Date): string {
  if (!input) return "-";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CustomersTableProps {
  customers: Customer[];
  stats: Record<string, CustomerStats>;
  totalCount: number;
  tab: StatusFilter;
  onTabChange: (tab: StatusFilter) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onView: (customer: Customer) => void;
}

export function CustomersTable({
  customers,
  stats,
  totalCount,
  tab,
  onTabChange,
  query,
  onQueryChange,
  onView,
}: CustomersTableProps) {
  const statsOf = (customer: Customer): CustomerStats => {
    const key = customer.email?.trim().toLowerCase() ?? customer.id;
    return stats[key] ?? { orders: 0, spent: 0 };
  };

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <h2 className="text-base font-semibold text-ink">All Customers</h2>

        <div
          role="tablist"
          aria-label="Filter customers by status"
          className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          {TABS.map((item) => {
            const isActive = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(item.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-surface text-ink shadow-card"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
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
            placeholder="Search customers"
            aria-label="Search customers by name or email"
            className="h-9 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors duration-150 focus:border-brand focus:bg-surface"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              <th scope="col" className="px-5 py-3">
                Serial
              </th>
              <th scope="col" className="px-3 py-3">
                Customer
              </th>
              <th scope="col" className="px-3 py-3">
                Status
              </th>
              <th scope="col" className="px-3 py-3">
                Orders
              </th>
              <th scope="col" className="px-3 py-3">
                Total Spent
              </th>
              <th scope="col" className="px-3 py-3">
                Tier
              </th>
              <th scope="col" className="px-3 py-3">
                Joined
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const status = USER_STATUS_META[customer.status];
              const customerStats = statsOf(customer);
              const tier = customerTier(customerStats.spent);
              const tierMeta = CUSTOMER_TIER_META[tier];
              const displayName = customer.name?.trim() || "Unnamed Customer";
              const displayEmail = customer.email?.trim() || "No email";

              return (
                <tr
                  key={customer.id}
                  className="border-b border-line align-middle transition-colors duration-150 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 text-sm tabular-nums text-ink-soft">
                    {customers.indexOf(customer) + 1}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar customer={customer} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{displayName}</p>
                        <p className="truncate text-xs text-ink-soft">{displayEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {customerStats.orders > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                        <ShoppingBagIcon className="h-3 w-3" aria-hidden="true" />
                        {customerStats.orders}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-ink-muted">No orders</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold tabular-nums text-ink">
                    {formatBdt(customerStats.spent)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tierMeta.chip}`}
                    >
                      {tierMeta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-ink-muted">
                    {formatDateOnly(customer.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(customer)}
                        aria-label={`View details for ${displayName}`}
                        className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink"
                      >
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <a
                        href={`mailto:${customer.email ?? ""}`}
                        aria-label={`Email ${displayName}`}
                        className="rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink"
                      >
                        <MailIcon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <InboxIcon className="h-6 w-6 text-ink-soft" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">No customers match this view</p>
          <p className="text-xs text-ink-muted">Clear the search or switch back to All.</p>
        </div>
      ) : (
        <p className="px-5 py-3 text-xs text-ink-soft">
          Showing {customers.length} of {totalCount} customers
          {tab !== "all" && ` · ${tab.charAt(0) + tab.slice(1).toLowerCase()} only`}
        </p>
      )}
    </section>
  );
}
