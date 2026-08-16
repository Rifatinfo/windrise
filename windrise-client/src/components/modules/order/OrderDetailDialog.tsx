"use client";

import { useEffect, useMemo, useState } from "react";
import {
  XIcon,
  CheckCircle2Icon,
  BanknoteIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  PencilIcon,
  SaveIcon,
  FileTextIcon,
} from "lucide-react";
import type { Order, OrderCustomer, OrderStatus } from "@/types/order";
import { formatBdt, formatDate, itemCount } from "@/utils/format";
import {
  buildTimeline,
  getPaymentMethodDisplay,
  PAYMENT_STATE_META,
  SHIPMENT_META,
  STATUS_META,
} from "@/utils/orderFlow";
import { StatusUpdateMenu } from "./StatusUpdateMenu";

interface OrderDetailDialogProps {
  order: Order | null;
  startInEdit: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onMarkCollected: (id: string) => void;
  onSaveInfo: (id: string, customer: OrderCustomer, billing: OrderCustomer | null) => void;
}

export function OrderDetailDialog({
  order,
  startInEdit,
  onClose,
  onStatusChange,
  onMarkCollected,
  onSaveInfo,
}: OrderDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(startInEdit);
  const [customer, setCustomer] = useState<OrderCustomer>(order?.customer ?? { name: "", phone: "" });
  const [billing, setBilling] = useState<OrderCustomer | null>(order?.billing ?? null);
  const [sameAsShipping, setSameAsShipping] = useState(!order?.billing);

  useEffect(() => {
    if (order) {
      setCustomer(order.customer);
      setBilling(order.billing ?? null);
      setSameAsShipping(!order.billing);
      setIsEditing(startInEdit);
    }
  }, [order, startInEdit]);

  useEffect(() => {
    if (!order) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  const timeline = useMemo(() => {
    if (!order) return [];
    return buildTimeline(order.status, order.placedAt);
  }, [order]);

  if (!order) return null;

  const statusMeta = STATUS_META[order.status];
  const paymentMeta = getPaymentMethodDisplay(order.payment.method, order.payment.gateway);
  const paymentState = PAYMENT_STATE_META[order.payment.state];
  const shipmentMeta = SHIPMENT_META[order.shipment];

  const canCollect =
    order.payment.method === "cod" && order.payment.state !== "paid" && order.payment.state !== "canceled";

  const handleSave = () => {
    onSaveInfo(order.id, customer, sameAsShipping ? null : billing);
    setIsEditing(false);
  };

  const updateCustomer = (field: keyof OrderCustomer, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const updateBilling = (field: keyof OrderCustomer, value: string) => {
    setBilling((prev) => (prev ? { ...prev, [field]: value } : { name: "", phone: "", [field]: value }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${order.orderNo}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        {/* Header */}
          <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">Order #{order.orderNo}</h2>
              <StatusUpdateMenu
                status={order.status}
                onChange={(status) => onStatusChange(order.id, status)}
                align="right"
              />
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              Placed {formatDate(order.placedAt)} · {itemCount(order)} items ·{" "}
              {formatBdt(order.totalAmount)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!order.invoiceUrl}
              onClick={() => order.invoiceUrl && window.open(order.invoiceUrl, "_blank")}
              aria-label="Download invoice"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-slate-300 disabled:opacity-40"
            >
              <FileTextIcon className="h-4 w-4" />
              Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Status summary */}
              <section className="rounded-xl border border-line bg-canvas p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Fulfillment
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${shipmentMeta.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${shipmentMeta.dot}`} />
                    {shipmentMeta.label}
                  </span>
                </div>

                <div className="mt-5">
                  <ol className="relative space-y-0">
                    {timeline.map((event, idx) => {
                      const isLast = idx === timeline.length - 1;
                      return (
                        <li key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                          {!isLast && (
                            <span className="absolute left-[9px] top-5 h-full w-px bg-line" />
                          )}
                          <span
                            className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${
                              isLast
                                ? "border-brand bg-brand"
                                : "border-slate-300 bg-surface"
                            }`}
                          >
                            {isLast && (
                              <CheckCircle2Icon className="h-3 w-3 text-white" />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-ink">{event.label}</p>
                            <p className="text-xs text-ink-soft">{formatDate(event.at)}</p>
                            {event.note && (
                              <p className="mt-1 text-xs text-ink-muted">{event.note}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>

              {/* Items */}
              <section className="rounded-xl border border-line bg-canvas p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Items
                </h3>
                <ul className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3"
                    >
                      <img
                        src={item.image ?? "/placeholder.png"}
                        alt={item.name}
                        className="h-16 w-12 shrink-0 rounded-md border border-line object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink-soft">
                          {item.color && `${item.color}`}
                          {item.color && item.size ? " / " : ""}
                          {item.size && `Size ${item.size}`}
                          {item.sku && (
                            <span className="ml-2 text-ink-muted">SKU: {item.sku}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-ink">
                          {formatBdt(item.total)}
                        </p>
                        <p className="text-xs text-ink-soft">Qty {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Payment */}
              <section className="rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    Payment
                  </h3>
                  {canCollect && (
                    <button
                      type="button"
                      onClick={() => onMarkCollected(order.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      <BanknoteIcon className="h-3 w-3" />
                      Mark Collected
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <BanknoteIcon className="h-3.5 w-3.5" />
                      Method
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${paymentMeta.chip}`}
                    >
                      {paymentMeta.short}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <CheckCircle2Icon className="h-3.5 w-3.5" />
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${paymentState.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${paymentState.dot}`} />
                      {paymentState.label}
                    </span>
                  </div>
                  {order.payment.transactionId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">Transaction</span>
                      <span className="tabular-nums text-ink">{order.payment.transactionId}</span>
                    </div>
                  )}
                  <div className="mt-2 border-t border-line pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink">Total</span>
                      <span className="font-semibold text-ink">{formatBdt(order.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>Subtotal</span>
                      <span>{formatBdt(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>Delivery</span>
                      <span>{formatBdt(order.deliveryCharge)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer info */}
              <section className="rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    Customer
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[10px] font-medium text-ink transition-colors hover:bg-slate-50"
                  >
                    {isEditing ? (
                      <>
                        <XIcon className="h-3 w-3" /> Cancel
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-3 w-3" /> Edit
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <InfoField
                    icon={<UserIcon className="h-3.5 w-3.5" />}
                    label="Name"
                    value={customer.name}
                    editing={isEditing}
                    onChange={(v) => updateCustomer("name", v)}
                  />
                  <InfoField
                    icon={<PhoneIcon className="h-3.5 w-3.5" />}
                    label="Phone"
                    value={customer.phone}
                    editing={isEditing}
                    onChange={(v) => updateCustomer("phone", v)}
                  />
                  <InfoField
                    icon={<MailIcon className="h-3.5 w-3.5" />}
                    label="Email"
                    value={customer.email ?? ""}
                    editing={isEditing}
                    onChange={(v) => updateCustomer("email", v)}
                    optional
                  />
                  <InfoField
                    icon={<MapPinIcon className="h-3.5 w-3.5" />}
                    label="State"
                    value={customer.state ?? ""}
                    editing={isEditing}
                    onChange={(v) => updateCustomer("state", v)}
                  />
                  <InfoField
                    icon={<MapPinIcon className="h-3.5 w-3.5" />}
                    label="Address"
                    value={customer.address ?? ""}
                    editing={isEditing}
                    onChange={(v) => updateCustomer("address", v)}
                    multiline
                  />
                </div>

                {/* Billing info */}
                {!isEditing && !billing ? null : (
                  <div className="mt-5 border-t border-line pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                        Billing
                      </h4>
                      {isEditing && (
                        <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-ink-muted">
                          <input
                            type="checkbox"
                            checked={sameAsShipping}
                            onChange={(e) => setSameAsShipping(e.target.checked)}
                            className="h-3 w-3 rounded border-line"
                          />
                          Same as shipping
                        </label>
                      )}
                    </div>

                    {!sameAsShipping && (
                      <div className="mt-3 space-y-3">
                        <InfoField
                          icon={<UserIcon className="h-3.5 w-3.5" />}
                          label="Name"
                          value={billing?.name ?? ""}
                          editing={isEditing}
                          onChange={(v) => updateBilling("name", v)}
                        />
                        <InfoField
                          icon={<PhoneIcon className="h-3.5 w-3.5" />}
                          label="Phone"
                          value={billing?.phone ?? ""}
                          editing={isEditing}
                          onChange={(v) => updateBilling("phone", v)}
                        />
                        <InfoField
                          icon={<MailIcon className="h-3.5 w-3.5" />}
                          label="Email"
                          value={billing?.email ?? ""}
                          editing={isEditing}
                          onChange={(v) => updateBilling("email", v)}
                          optional
                        />
                        <InfoField
                          icon={<MapPinIcon className="h-3.5 w-3.5" />}
                          label="State"
                          value={billing?.state ?? ""}
                          editing={isEditing}
                          onChange={(v) => updateBilling("state", v)}
                        />
                        <InfoField
                          icon={<MapPinIcon className="h-3.5 w-3.5" />}
                          label="Address"
                          value={billing?.address ?? ""}
                          editing={isEditing}
                          onChange={(v) => updateBilling("address", v)}
                          multiline
                        />
                      </div>
                    )}
                    {sameAsShipping && (
                      <p className="mt-2 text-xs text-ink-muted">Same as shipping address</p>
                    )}
                  </div>
                )}

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
                  >
                    <SaveIcon className="h-4 w-4" />
                    Save Changes
                  </button>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  editing,
  onChange,
  multiline = false,
  optional = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-soft">
        {icon}
        {label}
        {optional && <span className="normal-case text-ink-muted">(optional)</span>}
      </p>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-brand"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink outline-none focus:border-brand"
          />
        )
      ) : (
        <p className="mt-1 text-sm text-ink">{value || <span className="text-ink-muted">-</span>}</p>
      )}
    </div>
  );
}
