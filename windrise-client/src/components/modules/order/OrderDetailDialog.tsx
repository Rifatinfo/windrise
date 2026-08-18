"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  ReceiptTextIcon,
  SaveIcon,
  ShoppingBagIcon,
  UserIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import type { Order, OrderCustomer, OrderStatus } from "@/types/order";
import { formatBdt, itemCount } from "@/utils/format";
import {
  getPaymentMethodDisplay,
  isDropped,
  PAYMENT_STATE_META,
  STATUS_META,
} from "@/utils/orderFlow";
import { StatusUpdateMenu } from "./StatusUpdateMenu";
import { OrderStatusTimeline } from "./OrderStatusTimeline";
import { ReturnAction } from "./ReturnAction";

interface OrderDetailDialogProps {
  order: Order | null;
  startInEdit: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onMarkCollected: (id: string) => void;
  onSaveInfo: (id: string, customer: OrderCustomer, billing: OrderCustomer | null) => void;
}

function formatDateOnly(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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
  const [editingShipping, setEditingShipping] = useState(false);
  const [editingBilling, setEditingBilling] = useState(false);
  const [customer, setCustomer] = useState<OrderCustomer>(order?.customer ?? { name: "", phone: "" });
  const [billing, setBilling] = useState<OrderCustomer | null>(order?.billing ?? null);
  const [sameAsShipping, setSameAsShipping] = useState(!order?.billing);
  const [prevOrder, setPrevOrder] = useState<Order | null>(order);

  if (order !== prevOrder) {
    setPrevOrder(order);
    setCustomer(order?.customer ?? { name: "", phone: "" });
    setBilling(order?.billing ?? null);
    setSameAsShipping(!order?.billing);
    setIsEditing(startInEdit);
    setEditingShipping(false);
    setEditingBilling(false);
  }

  useEffect(() => {
    if (!order) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  const dropped = useMemo(() => (order ? isDropped(order.status) : false), [order]);

  if (!order) return null;

  const statusMeta = STATUS_META[order.status];
  const paymentMeta = getPaymentMethodDisplay(order.payment.method, order.payment.gateway);
  const paymentState = PAYMENT_STATE_META[order.payment.state];

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-surface shadow-pop ring-1 ring-black/5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-5 py-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-ink">Order #{order.orderNo}</h2>
            <StatusUpdateMenu
              status={order.status}
              onChange={(status) => onStatusChange(order.id, status)}
              align="right"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateOnly(order.placedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {formatTime(order.placedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShoppingBagIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {itemCount(order)} items
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!order.invoiceUrl}
              onClick={() => order.invoiceUrl && window.open(order.invoiceUrl, "_blank")}
              aria-label="Download invoice"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-canvas p-4 sm:p-6">
          <div className="space-y-6">
            {/* Tracking stepper */}
            <OrderStatusTimeline order={order} />

            {dropped && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
                  <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-rose-700">{statusMeta.label}</p>
                  <p className="text-xs text-rose-600/80">
                    This order was {statusMeta.label.toLowerCase()} and is no longer active.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Order summary */}
                <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <ReceiptTextIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">Order Summary</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${paymentMeta.chip}`}
                      >
                        {paymentMeta.short}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${paymentState.chip}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${paymentState.dot}`} />
                        {paymentState.label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                      <span className="text-sm text-ink-soft">Payment method</span>
                      <span className="text-sm font-medium text-ink">{paymentMeta.label}</span>
                    </div>

                    {canCollect && (
                      <button
                        type="button"
                        onClick={() => onMarkCollected(order.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                        Mark as Collected
                      </button>
                    )}

                    <ReturnAction orderId={order.id} />

                    <dl className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-ink-soft">Subtotal</dt>
                        <dd className="tabular-nums text-ink">{formatBdt(order.subtotal)}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-ink-soft">Delivery charge</dt>
                        <dd className="tabular-nums text-ink">{formatBdt(order.deliveryCharge)}</dd>
                      </div>
                      <div className="my-2 border-t border-dashed border-line" />
                      <div className="flex items-center justify-between">
                        <dt className="font-semibold text-ink">Total</dt>
                        <dd className="text-lg font-bold tabular-nums text-indigo-600">
                          {formatBdt(order.totalAmount)}
                        </dd>
                      </div>
                    </dl>

                    {order.payment.reference && (
                      <p className="rounded-lg bg-canvas px-3 py-2 text-[11px] text-ink-muted">
                        Reference: <span className="tabular-nums text-ink-soft">{order.payment.reference}</span>
                      </p>
                    )}
                  </div>
                </section>

                {/* Items */}
                <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold text-ink">
                      Items{" "}
                      <span className="ml-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                        {itemCount(order)}
                      </span>
                    </h3>
                  </div>

                  <ul className="space-y-3 p-5">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-3.5 rounded-xl border border-line bg-canvas/50 p-3.5 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                      >
                        <img
                          src={item.image ?? "/placeholder.png"}
                          alt={item.name}
                          className="h-16 w-12 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.sku && (
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                                SKU {item.sku}
                              </span>
                            )}
                            {item.size && (
                              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                                Size {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded-md bg-fuchsia-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-600">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold tabular-nums text-ink">{formatBdt(item.total)}</p>
                          <p className="mt-0.5 text-xs tabular-nums text-ink-muted">
                            {formatBdt(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Customer */}
                <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        <UserIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">Customer</h3>
                    </div>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink transition-colors hover:border-indigo-200 hover:text-indigo-600"
                      >
                        <PencilIcon className="h-3 w-3" aria-hidden="true" />
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    {!isEditing ? (
                      <>
                        <InfoField icon={<UserIcon />} label="Name" value={customer.name} />
                        <InfoField icon={<PhoneIcon />} label="Phone" value={customer.phone} />
                        <InfoField icon={<MailIcon />} label="Email" value={customer.email ?? ""} />
                        <InfoField icon={<MapPinIcon />} label="State" value={customer.state ?? ""} />
                      </>
                    ) : (
                      <>
                        <EditField label="Name" value={customer.name} onChange={(v) => updateCustomer("name", v)} />
                        <EditField label="Phone" value={customer.phone} onChange={(v) => updateCustomer("phone", v)} />
                        <EditField label="Email" value={customer.email ?? ""} onChange={(v) => updateCustomer("email", v)} />
                        <EditField label="State" value={customer.state ?? ""} onChange={(v) => updateCustomer("state", v)} />

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                          >
                            <SaveIcon className="h-4 w-4" aria-hidden="true" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Shipping address */}
                <AddressCard
                  icon={<MapPinIcon className="h-4 w-4" aria-hidden="true" />}
                  tint="bg-emerald-50 text-emerald-600"
                  title="Shipping Address"
                  editing={editingShipping}
                  onToggleEdit={() => setEditingShipping((v) => !v)}
                  values={{
                    name: customer.name,
                    phone: customer.phone,
                    state: customer.state ?? "",
                    address: customer.address ?? "",
                  }}
                  onChange={(field, value) => updateCustomer(field, value)}
                  onSave={() => {
                    onSaveInfo(order.id, customer, sameAsShipping ? null : billing);
                    setEditingShipping(false);
                  }}
                  onCancel={() => setEditingShipping(false)}
                />

                {/* Billing address */}
                <AddressCard
                  icon={<CreditCardIcon className="h-4 w-4" aria-hidden="true" />}
                  tint="bg-emerald-50 text-emerald-600"
                  title="Billing Address"
                  editing={editingBilling}
                  onToggleEdit={() => setEditingBilling((v) => !v)}
                  values={{
                    name: billing?.name ?? "",
                    phone: billing?.phone ?? "",
                    state: billing?.state ?? "",
                    address: billing?.address ?? "",
                  }}
                  onChange={(field, value) => updateBilling(field, value)}
                  onSave={() => {
                    onSaveInfo(order.id, customer, sameAsShipping ? null : billing);
                    setEditingBilling(false);
                  }}
                  onCancel={() => setEditingBilling(false)}
                  fallback="Same as shipping address"
                  sameAsShipping={sameAsShipping}
                  onSameAsShippingChange={(checked) => {
                    setSameAsShipping(checked);
                    if (checked) {
                      setBilling(null);
                    } else {
                      setBilling({ name: customer.name, phone: customer.phone });
                    }
                  }}
                />

                {/* Order note */}
                <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold text-ink">Order Note</h3>
                  </div>
                  <div className="p-5">
                    {order.orderNote ? (
                      <p className="whitespace-pre-wrap rounded-xl bg-canvas px-4 py-3 text-sm leading-relaxed text-ink">
                        {order.orderNote}
                      </p>
                    ) : (
                      <p className="text-sm italic text-ink-muted">No note attached to this order.</p>
                    )}
                  </div>
                </section>
              </div>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {icon}
        {label}
      </span>
      <span className="max-w-[60%] break-words text-right text-sm text-ink">
        {value || <span className="text-ink-muted">-</span>}
      </span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full rounded-lg border border-line bg-canvas/50 px-3 text-sm text-ink outline-none transition-colors focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function EditFieldArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full resize-none rounded-lg border border-line bg-canvas/50 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

type AddressValues = {
  name: string;
  phone: string;
  state: string;
  address: string;
};

function AddressCard({
  icon,
  tint,
  title,
  editing,
  onToggleEdit,
  values,
  onChange,
  onSave,
  onCancel,
  fallback,
  sameAsShipping,
  onSameAsShippingChange,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  editing: boolean;
  onToggleEdit: () => void;
  values: AddressValues;
  onChange: (field: keyof AddressValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  fallback?: string;
  sameAsShipping?: boolean;
  onSameAsShippingChange?: (checked: boolean) => void;
}) {
  const empty = !values.name && !values.phone && !values.address && !values.state;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
            {icon}
          </span>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={onToggleEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink transition-colors hover:border-indigo-200 hover:text-indigo-600"
          >
            <PencilIcon className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4 p-5">
        {editing ? (
          <>
            {typeof onSameAsShippingChange === "function" && (
              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => onSameAsShippingChange(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-line accent-indigo-600"
                />
                Same as shipping address
              </label>
            )}
            <EditField label="Name" value={values.name} onChange={(v) => onChange("name", v)} />
            <EditField label="Phone" value={values.phone} onChange={(v) => onChange("phone", v)} />
            <EditField label="State" value={values.state} onChange={(v) => onChange("state", v)} />
            <EditFieldArea label="Address" value={values.address} onChange={(v) => onChange("address", v)} />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onSave}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
              >
                <SaveIcon className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : fallback && empty ? (
          <p className="flex items-center gap-1.5 text-sm italic text-ink-muted">
            <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            {fallback}
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="font-semibold text-ink">{values.name || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="tabular-nums text-ink-soft">{values.phone || "-"}</span>
            </div>
            {values.address && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="leading-relaxed text-ink-soft">{values.address}</span>
              </div>
            )}
            {values.state && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="text-ink-soft">{values.state}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
