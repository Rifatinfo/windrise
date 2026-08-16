"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";
import type { Customer, CustomerStats } from "@/types/customer";
import type { ServerOrder } from "@/types/order";
import { getAllCustomers } from "@/services/customer/customer";
import { getAllOrders } from "@/services/order/order";
import { CustomerStatCards, type StatusFilter } from "./CustomerStatCards";
import { CustomersTable } from "./CustomersTable";
import { CustomerDetailDialog } from "./CustomerDetailDialog";

function orderStatsKey(order: ServerOrder): string {
  const email = order.checkoutEmail?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = order.name?.trim().toLowerCase() ?? "";
  const phone = order.phone?.trim().toLowerCase() ?? "";
  return `contact:${name}|${phone}`;
}

function customerStatsKey(customer: Customer): string {
  const email = customer.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = customer.name?.trim().toLowerCase() ?? "";
  return `contact:${name}|`;
}

function buildStats(orders: ServerOrder[]): Record<string, CustomerStats> {
  const map: Record<string, CustomerStats> = {};
  for (const order of orders) {
    const key = orderStatsKey(order);
    if (!key) continue;
    if (!map[key]) map[key] = { orders: 0, spent: 0 };
    map[key].orders += 1;
    map[key].spent += Number(order.totalAmount ?? 0);
  }
  return map;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Record<string, CustomerStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [customerResult, orderResult] = await Promise.all([
        getAllCustomers({ limit: 1000, sortBy: "createdAt", sortOrder: "desc" }),
        getAllOrders({ limit: 1000 }),
      ]);
      setCustomers(customerResult.data ?? []);
      setStats(buildStats(orderResult.data ?? []));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load customers";
      setError(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    setError("");
    fetchAll();
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (status !== "all" && customer.status !== status) return false;
      if (!needle) return true;
      return (
        customer.name?.toLowerCase().includes(needle) ||
        customer.email?.toLowerCase().includes(needle) ||
        customer.slug?.toLowerCase().includes(needle) ||
        customer.id.toLowerCase().includes(needle)
      );
    });
  }, [customers, query, status]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedId) ?? null;

  const selectedStats = selectedCustomer
    ? stats[customerStatsKey(selectedCustomer)] ?? { orders: 0, spent: 0 }
    : { orders: 0, spent: 0 };

  const totalSpent = useMemo(
    () => Object.values(stats).reduce((sum, value) => sum + value.spent, 0),
    [stats]
  );

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-[1440px] flex-col gap-4">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Customers</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Customers</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Every customer who has created an account on the store.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-ink-muted">
              {customers.length} accounts
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300 disabled:opacity-60"
            >
              <Loader2Icon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl bg-surface py-16">
            <Loader2Icon className="h-6 w-6 animate-spin text-ink-soft" />
            <p className="text-sm text-ink-muted">Loading customers...</p>
          </div>
        ) : (
          <div
            aria-busy={refreshing}
            className={`transition-opacity duration-200 ${refreshing ? "pointer-events-none opacity-60 " : ""}`}
          >
            <CustomerStatCards
              customers={customers}
              totalSpent={totalSpent}
              activeStatus={status}
              onSelectStatus={setStatus}
            />

            <CustomersTable
              customers={filtered}
              stats={stats}
              totalCount={customers.length}
              tab={status}
              onTabChange={setStatus}
              query={query}
              onQueryChange={setQuery}
              onView={(customer) => setSelectedId(customer.id)}
            />
          </div>
        )}
      </div>

      <CustomerDetailDialog
        customer={selectedCustomer}
        stats={selectedStats}
        onClose={() => setSelectedId(null)}
      />
    </main>
  );
}
