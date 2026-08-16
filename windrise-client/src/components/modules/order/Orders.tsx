"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { DateRangeMenu } from "@/components/modules/inventory/DateRangeMenu";
import {
  thisMonthRange,
  type DateRangeSelection,
} from "@/components/modules/inventory/inventory.utils";
import type { Order, OrderStatus } from "@/types/order";
import { formatDate, itemCount, orderTotal } from "@/utils/format";
import { STATUS_META } from "@/utils/orderFlow";
import { OrderTab } from "./OrdersTable";
import { OrderStatCards } from "./OrderStatCards";
import { PaymentMix } from "./PaymentMix";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailDialog } from "./OrderDetailDialog";
import type { OrderCustomer } from "@/types/order";
import {
  getAllOrders,
  markOrderCollected,
  updateOrderInfo,
  updateOrderStatus,
} from "@/services/order/order";
import { mapServerOrdersToUi } from "@/lib/orderMapper";

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [range, setRange] = useState<DateRangeSelection>(() => thisMonthRange());
  const [toast, setToast] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [openInEdit, setOpenInEdit] = useState(false);

  const fetchOrders = async (selection: DateRangeSelection) => {
    try {
      const result = await getAllOrders({
        startDate: selection.start,
        endDate: selection.end,
        limit: 1000,
      });
      setOrders(mapServerOrdersToUi(result.data ?? []));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const applyRange = (selection: DateRangeSelection) => {
    setRange(selection);
    setRefreshing(true);
    setError("");
    fetchOrders(selection);
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const start = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T23:59:59.999`);
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      const placed = new Date(order.placedAt);
      if (Number.isNaN(placed.getTime()) || placed < start || placed > end) return false;
      if (!needle) return true;
      return (
        order.orderNo.toLowerCase().includes(needle) ||
        order.id.toLowerCase().includes(needle) ||
        order.customer.name.toLowerCase().includes(needle) ||
        order.customer.phone.includes(needle)
      );
    });
  }, [orders, query, status, range]);

  const openOrder = orders.find((order) => order.id === openOrderId) ?? null;

  const open = (order: Order, edit: boolean) => {
    setOpenInEdit(edit);
    setOpenOrderId(order.id);
  };

  const tab: OrderTab =
    status === "placed" || status === "processed" || status === "on_the_way" || status === "delivered"
      ? status
      : "all";

  const refreshOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const updateStatus = async (id: string, nextStatus: OrderStatus) => {
    try {
      const response = await updateOrderStatus(id, nextStatus.toUpperCase());
      const updated = mapServerOrdersToUi([response.data])[0];
      refreshOrder(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
    }
  };

  const markCollected = async (id: string) => {
    try {
      const response = await markOrderCollected(id);
      const updated = mapServerOrdersToUi([response.data])[0];
      refreshOrder(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark collected";
      setError(message);
    }
  };

  const updateInfo = async (
    id: string,
    customer: OrderCustomer,
    billing: OrderCustomer | null
  ) => {
    try {
      const response = await updateOrderInfo(id, {
        name: customer.name,
        phone: customer.phone,
        state: customer.state ?? undefined,
        address: customer.address ?? undefined,
        billingName: billing?.name ?? null,
        billingPhone: billing?.phone ?? null,
        billingEmail: billing?.email ?? null,
        billingState: billing?.state ?? null,
        billingAddress: billing?.address ?? null,
      });
      const updated = mapServerOrdersToUi([response.data])[0];
      refreshOrder(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update info";
      setError(message);
    }
  };

  const exportOrdersCsv = () => {
    if (filtered.length === 0) {
      notify("No orders to export for this range");
      return;
    }

    const header = [
      "Order No",
      "Placed At",
      "Customer",
      "Phone",
      "Items",
      "Total (BDT)",
      "Payment Method",
      "Payment Status",
      "Order Status",
    ];
    const lines = filtered.map((order) => [
      order.orderNo,
      formatDate(order.placedAt),
      order.customer.name,
      order.customer.phone,
      itemCount(order),
      orderTotal(order),
      order.payment.method === "cod" ? "COD" : "Online",
      order.payment.state,
      STATUS_META[order.status].label,
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orders-${range.start}-to-${range.end}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Orders exported — CSV downloaded");
  };

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 mb-8">
        <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Orders</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeMenu value={range.label} onChange={applyRange} />
            <button
              type="button"
              onClick={exportOrdersCsv}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300"
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl  bg-surface py-16">
            <Loader2Icon className="h-6 w-6 animate-spin text-ink-soft" />
            <p className="text-sm text-ink-muted">Loading orders...</p>
          </div>
        ) : (
          <div
            aria-busy={refreshing}
            className={`transition-opacity duration-200 ${refreshing ? "pointer-events-none opacity-60 " : ""}`}
          >
            <OrderStatCards
              orders={orders}
              activeStatus={status}
              onSelectStatus={setStatus}
            />
            <PaymentMix orders={orders} />

            <OrdersTable
              orders={filtered}
              totalCount={orders.length}
              tab={tab}
              onTabChange={(value) => setStatus(value === "all" ? "all" : value)}
              query={query}
              onQueryChange={setQuery}
              onView={(order) => open(order, false)}
              onEdit={(order) => open(order, true)}
              onStatusChange={updateStatus}
            />
          </div>
        )}
      </div>

      <OrderDetailDialog
        order={openOrder}
        startInEdit={openInEdit}
        onClose={() => setOpenOrderId(null)}
        onStatusChange={updateStatus}
        onMarkCollected={markCollected}
        onSaveInfo={updateInfo}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-pop"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
