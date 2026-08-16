"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";
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
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [openInEdit, setOpenInEdit] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllOrders();
      setOrders(mapServerOrdersToUi(result.data ?? []));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!needle) return true;
      return (
        order.orderNo.toLowerCase().includes(needle) ||
        order.id.toLowerCase().includes(needle) ||
        order.customer.name.toLowerCase().includes(needle) ||
        order.customer.phone.includes(needle)
      );
    });
  }, [orders, query, status]);

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

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Orders</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300"
            >
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              This Month
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300"
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
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface py-16">
            <Loader2Icon className="h-6 w-6 animate-spin text-ink-soft" />
            <p className="text-sm text-ink-muted">Loading orders...</p>
          </div>
        ) : (
          <>
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
          </>
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
    </main>
  );
}
