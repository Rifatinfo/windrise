"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DownloadIcon, TruckIcon } from "lucide-react";
import { getOrderById, getOrderByTransactionId } from "@/services/order/order";
import { buildGatewayLabel, normalizeGatewayLabelString } from "@/utils/orderFlow";
import { Breadcrumb } from "./Breadcrumb";

type OrderItem = {
  id: string;
  productName: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  total: number;
  productImage: string | null;
};

type OrderPayment = {
  paymentMethod?: string | null;
  paymentStatus?: "UNPAID" | "PAID" | "FAILED" | "CANCELED" | string;
  cardType?: string | null;
  cardIssuer?: string | null;
  paymentGatewayData?: Record<string, any> | null;
};

type Order = {
  id: string;
  orderNo: string | null;
  name: string;
  phone: string;
  state: string;
  address: string;
  checkoutEmail: string | null;
  createdAt: string;
  subtotal: number;
  totalAmount: number;
  deliveryCharge: number | null;
  paymentMethod?: "COD" | "ONLINE" | string;
  paymentStatus?: "UNPAID" | "PAID" | "FAILED" | "CANCELED" | string;
  invoiceUrl?: string | null;
  billingName?: string | null;
  billingPhone?: string | null;
  billingEmail?: string | null;
  billingState?: string | null;
  billingAddress?: string | null;
  items: OrderItem[];
  payment?: OrderPayment | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function OrderComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const status = searchParams.get("status") ?? "";
  const statusMessage = searchParams.get("message") ?? "";
  const queryInvoiceUrl = searchParams.get("invoiceUrl") ?? "";

  const transactionId = searchParams.get("transactionId") ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId || transactionId));
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId && !transactionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetcher = orderId
      ? getOrderById(orderId)
      : getOrderByTransactionId(transactionId);

    fetcher
      .then((res) => {
        if (!cancelled) setOrder(res.data as Order);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, transactionId]);

  const isSuccess = status !== "fail" && status !== "cancel";

  const statusTitle =
    status === "fail"
      ? "PAYMENT FAILED"
      : status === "cancel"
        ? "PAYMENT CANCELLED"
        : "Order Placed Successfully!";

  const statusSubtitle =
    status === "fail"
      ? statusMessage || "We couldn't process your payment."
      : status === "cancel"
        ? statusMessage || "You cancelled the payment."
        : "Your order has been confirmed";

  const addressLines = order
    ? ([order.checkoutEmail, order.phone, order.address, order.state].filter(
        Boolean
      ) as string[])
    : [];

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const orderNumber = order?.orderNo || order?.id || "-";

  const paymentLabel = (() => {
    if (!order) return "-";
    if (order.paymentMethod === "COD") return "Cash on Delivery";

    const gatewayData = order.payment?.paymentGatewayData;
    const gatewayInfo = {
      cardType:
        order.payment?.cardType?.trim() ||
        gatewayData?.card_type?.toString().trim(),
      cardIssuer:
        order.payment?.cardIssuer?.trim() ||
        gatewayData?.card_issuer?.toString().trim(),
      cardBrand: gatewayData?.card_brand?.toString().trim(),
      cardNo: gatewayData?.card_no?.toString().trim(),
    };

    const fromData = buildGatewayLabel(gatewayInfo);
    if (fromData) return fromData;

    const stored = order.payment?.paymentMethod || order.paymentMethod;
    const normalized = normalizeGatewayLabelString(stored);
    if (normalized) return normalized;

    return "SSLCommerz Online";
  })();

  const paymentStatusText =
    order?.paymentStatus === "PAID"
      ? "Paid"
      : order?.paymentStatus === "UNPAID"
        ? "Unpaid"
        : order?.paymentStatus || "Unpaid";

  const invoiceUrl = order?.invoiceUrl || queryInvoiceUrl;
  const invoiceHref = invoiceUrl
    ? invoiceUrl.startsWith("http")
      ? invoiceUrl
      : `${API_URL}${invoiceUrl}`
    : "";

  const handleDownloadInvoice = async () => {
    if (!invoiceHref) return;
    setDownloading(true);
    try {
      const res = await fetch(invoiceHref);
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open the invoice in a new tab if CORS/static serving blocks the fetch.
      window.open(invoiceHref, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <p className="text-[12px] text-[#8f8f8f]">Loading order details...</p>
      </div>
    );
  }

  if (error || (!order && !status)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white">
        {status ? (
          <>
            <h1 className="text-[15px] font-semibold tracking-[0.04em] text-[#1a1a1a]">
              {statusTitle}
            </h1>
            {statusSubtitle && (
              <p className="text-[12px] text-[#8f8f8f]">{statusSubtitle}</p>
            )}
          </>
        ) : (
          <p className="text-[12px] text-[#e0322b]">{error || "Order not found"}</p>
        )}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white">
        <h1 className="text-[15px] font-semibold tracking-[0.04em] text-[#1a1a1a]">
          {statusTitle}
        </h1>
        {statusSubtitle && (
          <p className="text-[12px] text-[#8f8f8f]">{statusSubtitle}</p>
        )}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  const items = order.items ?? [];
  const subtotal = order.subtotal ?? 0;
  const deliveryCharge = order.deliveryCharge ?? 0;
  const total = order.totalAmount ?? 0;

  return (
    <div className="w-full min-h-full bg-white">
      {/* Breadcrumb */}
      <div className=" w-full  px-6 py-4 sm:px-10 md:px-20 lg:px-20 lg:mt-20 mt-16">
        <Breadcrumb current="Order Placed" />
      </div>

      {/* Confirmation band */}
      <section className="w-full bg-[#f2f7f8] px-5 py-10 sm:px-10 lg:py-14">
        <div className="mx-auto w-full max-w-[890px]">
          {isSuccess && (
            <div className="flex justify-center">
              <img
                src="/assets/Sucess Icon.png"
                alt=""
                aria-hidden="true"
                className="h-[52px] w-[52px] lg:h-[58px] lg:w-[58px]"
              />
            </div>
          )}

          <h1 className="mt-4 text-center text-[17px] font-semibold text-[#1a1a1a] lg:text-[26px]">
            {statusTitle}
          </h1>
          <p className="mt-1 text-center text-[11px] text-[#4a4a4a] lg:mt-2 lg:text-[14px]">
            {isSuccess ? statusSubtitle : `Order No. ${orderNumber}`}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6 sm:text-left lg:mt-14">
            <div>
              <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a] lg:text-[11px]">
                SHIPPING TO
              </h2>
              <p className="mt-2 text-[13px] font-semibold text-[#1a1a1a] lg:mt-3 lg:text-[15px]">
                {order.name}
              </p>
              <address className="mt-1 space-y-[4px] text-[12px] not-italic text-[#1a1a1a] lg:space-y-[6px] lg:text-[14px]">
                {addressLines.map((line, idx) => (
                  <span key={`${line}-${idx}`} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div>
              <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a] lg:text-[11px]">
                BILLING TO
              </h2>
              <p className="mt-2 text-[13px] font-semibold text-[#1a1a1a] lg:mt-3 lg:text-[15px]">
                {order.billingName || order.name}
              </p>
              <address className="mt-1 space-y-[4px] text-[12px] not-italic text-[#1a1a1a] lg:space-y-[6px] lg:text-[14px]">
                {(order.billingName
                  ? ([order.billingEmail, order.billingPhone, order.billingAddress, order.billingState].filter(Boolean) as string[])
                  : addressLines
                ).map((line, idx) => (
                  <span key={`${line}-${idx}`} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div className="space-y-6 lg:space-y-7">
              <div>
                <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a] lg:text-[11px]">
                  ORDER DATE
                </h2>
                <p className="mt-2 text-[12px] text-[#1a1a1a] lg:mt-3 lg:text-[14px]">
                  {orderDate}
                </p>
              </div>
              <div>
                <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a] lg:text-[11px]">
                  <span className="sm:hidden">ORDER ID</span>
                  <span className="hidden sm:inline">ORDER NUMBER</span>
                </h2>
                <p className="mt-2 text-[12px] text-[#1a1a1a] lg:mt-3 lg:text-[14px]">
                  {orderNumber}
                </p>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a] lg:text-[11px]">
                  PAYMENT METHOD
                </h2>
                <p className="mt-2 text-[12px] text-[#1a1a1a] lg:mt-3 lg:text-[14px]">
                  {paymentLabel}{" "}
                  <span className="italic text-[#8f8f8f]">{paymentStatusText}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 lg:mt-14 lg:gap-10">
            <button
              type="button"
              disabled={!order}
              onClick={() => order && router.push(`/order-tracking/${order.id}`)}
              className="inline-flex h-[38px] w-full max-w-[150px] items-center justify-center gap-2 bg-[#0b0b0b] text-[10px] tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:h-[46px] lg:max-w-[210px] lg:text-[12px]"
            >
              <TruckIcon className="h-4 w-4" />
              TRACK YOUR ORDER
            </button>
            <button
              type="button"
              disabled={!invoiceHref || downloading}
              onClick={handleDownloadInvoice}
              className="flex h-[38px] w-full max-w-[150px] items-center justify-center gap-2 border border-[#c9c9c9] bg-white text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50 lg:h-[46px] lg:max-w-[210px] lg:text-[12px]"
            >
              {downloading ? "DOWNLOADING..." : "DOWNLOAD INVOICE"}
              <DownloadIcon
                className="h-[13px] w-[13px] rounded-full border border-[#8f8f8f] p-[1px] lg:h-[16px] lg:w-[16px]"
                strokeWidth={1.6}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="px-5 pb-16 pt-10 sm:px-10 lg:pb-24 lg:pt-14">
        <div className="mx-auto w-full max-w-[890px]">
          <h2 className="text-center text-[14px] text-[#1a1a1a]">Your Order Summary</h2>

          <div className="mt-8 grid grid-cols-[1fr_90px_90px] border-b border-[#e6e6e6] pb-2 text-[11px] tracking-[0.08em] text-[#4a4a4a]">
            <span>PRODUCT</span>
            <span className="text-center">QUANTITY</span>
            <span className="text-right">PRICE</span>
          </div>

          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_44px_80px] items-start border-b border-[#ededed] py-5 sm:grid-cols-[1fr_90px_90px]"
              >
                <div className="flex gap-4">
                  <img
                    src={item.productImage || "/placeholder.png"}
                    alt={item.productName}
                    className="h-[110px] w-[80px] shrink-0 bg-[#f4f4f4] object-cover"
                  />
                  <div className="min-w-0 pt-1">
                    <h3 className="text-[13px] font-medium text-[#1a1a1a]">{item.productName}</h3>
                    <dl className="mt-2 space-y-1 text-[11px]">
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Product SKU:</dt>
                        <dd className="text-[#1a1a1a]">{item.sku}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Size:</dt>
                        <dd className="text-[#1a1a1a]">{item.size}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Color:</dt>
                        <dd className="text-[#1a1a1a]">{item.color}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <span className="pt-1 text-center text-[11px] text-[#1a1a1a]">
                  {item.quantity}
                </span>
                <span className="pt-1 text-right text-[14px] text-[#1a1a1a]">
                  ৳ {item.total}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 text-[11px]">
            <div className="flex items-center justify-between border-b border-[#ededed] py-3">
              <dt className="text-[#1a1a1a]">Subtotal</dt>
              <dd className="text-[#1a1a1a]">৳ {subtotal}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-[#ededed] py-3">
              <dt className="text-[#1a1a1a]">Shipping</dt>
              <dd className="text-[#1a1a1a]">৳ {deliveryCharge}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[12px] tracking-[0.06em] text-[#1a1a1a]">TOTAL</dt>
              <dd className="text-[18px] text-[#1a1a1a]">৳ {total}</dd>
            </div>
          </dl>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
