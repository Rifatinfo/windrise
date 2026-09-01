"use client";

import Image from "next/image";
import Link from "next/link";
import { HeadsetIcon } from "lucide-react";

import type { ChatCard } from "@/services/chatbot/chatbot";
import { chatMediaUrl, productHref } from "@/services/chatbot/chatbot";

const tk = (value: number) => `৳ ${Math.round(value).toLocaleString("en-US")}`;

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** Reads "ON_THE_WAY" as "On the Way". */
const prettyStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((word, index) => (index === 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const CARD = "rounded-xl border border-[#ECEAF4] bg-white p-3.5";

/** Windee 05 — the order summary. */
function OrderCard({ card }: { card: Extract<ChatCard, { kind: "order" }> }) {
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#1B1830]">Order {card.orderNo}</p>
        <span className="shrink-0 rounded-full bg-[#E8F6EE] px-2 py-0.5 text-[9px] font-medium text-[#1F9254]">
          {prettyStatus(card.status)}
        </span>
      </div>

      <dl className="mt-3 space-y-2.5">
        {[
          ["Order Date", shortDate(card.placedAt)],
          ["Total Amount", tk(card.totalAmount)],
          ["Payment Method", card.paymentMethod],
        ].map(([label, value], index) => (
          <div key={label} className={index > 0 ? "border-t border-[#F2F1F7] pt-2.5" : ""}>
            <dt className="text-[9px] text-[#9B98AC]">{label}</dt>
            <dd className="mt-0.5 text-[12px] font-medium text-[#1B1830]">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href="/order-tracking"
        className="mt-3 block rounded-lg border border-[#DCD8F0] py-2 text-center text-[11px] font-medium text-[#6B4EE6] transition-colors hover:bg-[#F7F5FF]"
      >
        View details
      </Link>
    </div>
  );
}

/** Windee 06 — the product strip. */
function ProductsCard({ card }: { card: Extract<ChatCard, { kind: "products" }> }) {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-semibold capitalize text-[#1B1830]">
          {card.title}
        </p>
        <Link href="/" className="shrink-0 text-[10px] font-medium text-[#6B4EE6]">
          View all
        </Link>
      </div>

      {/* Scrolls sideways inside the bubble rather than widening it. */}
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {card.products.map((product) => {
          const tile = (
            <>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#F2F1F7]">
                {chatMediaUrl(product.image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={chatMediaUrl(product.image) ?? ""}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-[#4A4660]">
                {product.name}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-[#1B1830]">
                {tk(product.price)}
              </p>
            </>
          );

          const href = productHref(product);

          // Without a category there is no product page to open, so the tile
          // stays a plain block rather than a link that lands somewhere wrong.
          return href ? (
            <Link key={product.productId} href={href} className="w-[86px] shrink-0">
              {tile}
            </Link>
          ) : (
            <div key={product.productId} className="w-[86px] shrink-0">
              {tile}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Windee 04/05 — the approval prompt.
 *
 * This is the only control that can place or cancel an order: the assistant
 * proposes, the server holds the priced payload, and these buttons commit it.
 * The figures shown are the ones that will run.
 */
function ConfirmCard({
  card,
  busy,
  onConfirm,
  onDecline,
}: {
  card: Extract<ChatCard, { kind: "confirm-order" | "confirm-cancel" }>;
  busy: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const isCancel = card.kind === "confirm-cancel";

  return (
    <div className="rounded-xl border border-[#DCD8F0] bg-[#FAF9FF] p-3.5">
      <p className="text-[12px] font-semibold text-[#1B1830]">
        {isCancel ? "Cancel this order?" : "Confirm your order"}
      </p>

      {isCancel ? (
        <div className="mt-2.5 space-y-1">
          <p className="text-[11px] text-[#4A4660]">Order {card.orderNo}</p>
          {card.items.map((line) => (
            <p key={line} className="text-[11px] text-[#6E6A82]">
              {line}
            </p>
          ))}
          <p className="pt-1 text-[11px] font-medium text-[#1B1830]">{tk(card.total)}</p>
        </div>
      ) : (
        <div className="mt-2.5 space-y-1.5">
          {card.items.map((line, index) => (
            <div key={`${line.name}-${index}`} className="flex justify-between gap-3">
              <span className="text-[11px] text-[#4A4660]">
                {line.quantity} × {line.name}
                {line.size || line.color ? (
                  <span className="text-[#9B98AC]">
                    {" "}
                    ({[line.size, line.color].filter(Boolean).join(", ")})
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[11px] text-[#4A4660]">{tk(line.total)}</span>
            </div>
          ))}

          <div className="flex justify-between border-t border-[#EAE7F7] pt-1.5 text-[11px] text-[#6E6A82]">
            <span>Delivery</span>
            <span>{tk(card.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-[12px] font-semibold text-[#1B1830]">
            <span>Total</span>
            <span>{tk(card.total)}</span>
          </div>
          <p className="pt-1 text-[10px] leading-relaxed text-[#9B98AC]">
            {card.deliverTo.name} · {card.deliverTo.phone}
            <br />
            {card.deliverTo.address}, {card.deliverTo.state} · {card.paymentMethod}
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          className="flex-1 rounded-full border border-[#DCD8F0] bg-white py-2 text-[11px] font-medium text-[#6B4EE6] transition-colors hover:bg-[#F7F5FF] disabled:opacity-50"
        >
          {isCancel ? "Keep order" : "Not now"}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 rounded-full bg-[#6B4EE6] py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#5B3FD6] disabled:opacity-50"
        >
          {busy ? "Working…" : isCancel ? "Yes, cancel" : "Confirm order"}
        </button>
      </div>
    </div>
  );
}

/** Windee 04 — the outcome of a committed action. */
function OutcomeCard({
  card,
}: {
  card: Extract<ChatCard, { kind: "order-placed" | "order-cancelled" }>;
}) {
  const placed = card.kind === "order-placed";

  return (
    <div
      className={`rounded-xl border p-3.5 ${
        placed ? "border-[#CFEBDA] bg-[#F3FBF6]" : "border-[#F3D9D9] bg-[#FDF6F6]"
      }`}
    >
      <p className="text-[12px] font-semibold text-[#1B1830]">
        {placed ? "Order confirmed" : "Order cancelled"}
      </p>
      {card.orderNo && (
        <p className="mt-1 text-[11px] text-[#4A4660]">Order {card.orderNo}</p>
      )}
      {placed && card.total ? (
        <p className="mt-0.5 text-[11px] text-[#4A4660]">
          {tk(card.total)} · Cash on Delivery
        </p>
      ) : null}
    </div>
  );
}

/** Windee 04/07 — offer of a person. */
export function HelpCard({
  busy,
  onTalkToHuman,
  onContinue,
}: {
  busy: boolean;
  onTalkToHuman: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E6E2F6] bg-[#F7F5FF] p-3">
      <div className="flex gap-2.5">
        <Image
          src="/assets/help-support-Icon.png"
          alt=""
          width={34}
          height={34}
          className="h-[34px] w-[34px] shrink-0 select-none"
        />
        <div>
          <p className="text-[12px] font-semibold text-[#1B1830]">Need more help?</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#6E6A82]">
            You can continue chatting with Windee or talk to our support team for
            personalised assistance.
          </p>
          {/* The reference sets a fixed "5-15 min" here. There is no agent
              queue behind this yet, so promising a number would be a claim the
              system cannot keep — this says what is actually true instead. */}
          <p className="mt-1.5 text-[10.5px] font-medium text-[#1F9254]">
            Our team replies as soon as they&apos;re online
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <button
          type="button"
          onClick={onTalkToHuman}
          disabled={busy}
          className="flex-1 rounded-full border border-[#DCD8F0] bg-white py-2 text-[10px] font-medium text-[#6B4EE6] transition-colors hover:bg-[#F2EEFF] disabled:opacity-50"
        >
          Talk to a human
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={busy}
          className="flex-1 rounded-full bg-[#6B4EE6] py-2 text-[10px] font-medium text-white transition-colors hover:bg-[#5B3FD6] disabled:opacity-50"
        >
          Continue with Windee
        </button>
      </div>
    </div>
  );
}

/**
 * Windee 08 — waiting on a person.
 *
 * The wording follows the real presence of the team rather than a fixed line:
 * telling someone agents are "assisting other customers" when nobody is signed
 * in would be a promise the system cannot keep, and the opposite understates a
 * queue that really is being worked.
 */
export function QueueCard({ agentsAvailable }: { agentsAvailable: boolean }) {
  return (
    <div className="rounded-xl bg-[#F5F4FA] p-4 text-center">
      <Image
        src="/assets/loading-clock-icon-2.png"
        alt=""
        width={30}
        height={30}
        className="mx-auto h-[30px] w-[30px] select-none"
      />
      <p className="mt-2 text-[12px] font-semibold text-[#1B1830]">You&apos;re in the queue</p>
      <p className="mt-1 text-[10.5px] leading-relaxed text-[#6E6A82]">
        {agentsAvailable ? (
          <>
            Our agents are currently assisting other customers.
            <br />
            Please stay on this chat.
            <br />
            You&apos;ll be connected soon.
          </>
        ) : (
          <>
            Our team isn&apos;t online right now. Stay on this chat — someone will pick it
            up as soon as they&apos;re available.
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Pinned above the composer for as long as a person is involved.
 *
 * Windee genuinely stops answering during a handoff, so this is not decoration:
 * without it a customer sending a message into the queue would reasonably
 * expect the bot to pick it up.
 */
export function SupportNotice({ connected }: { connected: boolean }) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-xl bg-[#FFF8EC] p-3">
      <Image
        src="/assets/connect-support-logo.png"
        alt=""
        width={36}
        height={36}
        className="mt-px h-[36px] w-[36px] shrink-0 select-none"
      />
      <p className="text-[10.5px] leading-relaxed text-[#8A6A25]">
        Windee won&apos;t reply while you&apos;re{" "}
        {connected ? "chatting with" : "waiting for"} our support team.
      </p>
    </div>
  );
}

/** Windee 09 — a person has joined the thread. */
export function ConnectedCard({ agentName }: { agentName: string | null }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[#CFEBDA] bg-[#F3FBF6] p-3">
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#DCF1E5]">
        <HeadsetIcon className="h-4 w-4 text-[#1F9254]" />
      </span>
      <div>
        <p className="text-[12px] font-semibold text-[#1F9254]">
          You&apos;re connected to a support agent
        </p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-[#4A6B57]">
          {agentName ? `${agentName} has` : "A member of our support team has"} joined the
          chat and is ready to assist you.
        </p>
      </div>
    </div>
  );
}

/** Picks the right card for a message's payload. */
export function ChatCardView({
  card,
  busy,
  onConfirm,
  onDecline,
}: {
  card: ChatCard;
  busy: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  switch (card.kind) {
    case "order":
      return <OrderCard card={card} />;
    case "products":
      return <ProductsCard card={card} />;
    case "confirm-order":
    case "confirm-cancel":
      return (
        <ConfirmCard card={card} busy={busy} onConfirm={onConfirm} onDecline={onDecline} />
      );
    case "order-placed":
    case "order-cancelled":
      return <OutcomeCard card={card} />;
    default:
      return null;
  }
}
