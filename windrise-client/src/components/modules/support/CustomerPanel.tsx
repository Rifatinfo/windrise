"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUpIcon, PlusIcon, XIcon } from "lucide-react";

import type { ConversationDetail } from "@/services/support/support";
import {
  Avatar,
  CHANNEL_META,
  ORDER_STATUS_TONE,
  PRIORITY_BADGE,
  STATUS_BADGE,
  longDateTime,
  prettyEnum,
  shortDate,
  tk,
} from "./support.helpers";

const PANEL =
  "rounded-xl border border-[#e8eaf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

function Section({
  title,
  children,
  action,
  defaultOpen = true,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={PANEL}>
      <header className="flex items-center justify-between gap-2 px-4 py-3.5">
        <h2 className="text-[13.5px] font-semibold text-[#1b2033]">{title}</h2>
        <div className="flex items-center gap-1">
          {action}
          <button
            type="button"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8b93a7] transition-colors hover:bg-[#f4f5f8]"
          >
            <ChevronUpIcon
              className={`h-4 w-4 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
            />
          </button>
        </div>
      </header>

      {open && children ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[7px]">
      <span className="shrink-0 text-[12px] text-[#8b93a7]">{label}</span>
      <span className="min-w-0 truncate text-right text-[12px] text-[#2b3049]">{value}</span>
    </div>
  );
}

export function CustomerPanel({
  detail,
  onAddTag,
  onRemoveTag,
  onOpenConversation,
}: {
  detail: ConversationDetail | null;
  onAddTag: (name: string) => Promise<void>;
  onRemoveTag: (tagId: string) => Promise<void>;
  onOpenConversation: (id: string) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!detail) {
    return (
      <div className={`${PANEL} px-4 py-8`}>
        <p className="text-center text-[12px] text-[#9aa1b1]">
          Customer details appear here once you open a conversation.
        </p>
      </div>
    );
  }

  const { conversation, customer } = detail;
  const channel = CHANNEL_META[conversation.channel];
  const status = STATUS_BADGE[conversation.status];
  const priority = PRIORITY_BADGE[conversation.priority];

  const submitTag = async () => {
    if (!tagInput.trim() || busy) return;
    setBusy(true);
    try {
      await onAddTag(tagInput.trim());
      setTagInput("");
      setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    /*
      Stacked in its own narrow column on a wide screen, but when the layout
      folds this panel underneath the thread it becomes very wide — so its
      sections spread into columns rather than stretching one per row.
    */
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @min-[620px]:grid-cols-2 @min-[980px]:grid-cols-3">
      <Section title="Customer Details">
        <div className="flex flex-col items-center gap-2.5 pb-1 pt-1 text-center">
          <Avatar name={customer.name} src={customer.avatarUrl} size={64} />
          <div className="space-y-1">
            <p className="text-[13.5px] font-semibold text-[#1b2033]">{customer.name}</p>
            {customer.email && <p className="text-[12px] text-[#7b8194]">{customer.email}</p>}
            {customer.phone && <p className="text-[12px] text-[#7b8194]">{customer.phone}</p>}
            {customer.location && (
              <p className="text-[12px] text-[#7b8194]">{customer.location}</p>
            )}
            {!customer.email && !customer.phone && !customer.location && (
              // Messenger never gives us contact details, so say so plainly
              // rather than showing empty rows that look like a loading bug.
              <p className="text-[11.5px] text-[#9aa1b1]">
                No contact details shared on this channel.
              </p>
            )}
          </div>
        </div>

        {customer.userId ? (
          <Link
            href={`/admin/customer?userId=${customer.userId}`}
            className="mt-3 block rounded-lg border border-[#e0e3ea] py-2 text-center text-[12px] font-medium text-[#3d4459] transition-colors hover:bg-[#f7f8fb]"
          >
            View Full Profile
          </Link>
        ) : (
          <p
            title="This person has not been matched to an account yet."
            className="mt-3 block cursor-not-allowed rounded-lg border border-[#eef0f4] py-2 text-center text-[12px] text-[#b0b6c3]"
          >
            View Full Profile
          </p>
        )}
      </Section>

      <Section title="Conversation Info">
        <div className="divide-y divide-[#f2f4f7]">
          <InfoRow label="Channel" value={channel.label} />
          <InfoRow label="Started At" value={longDateTime(conversation.createdAt)} />
          <InfoRow label="Queue" value={conversation.queue?.name ?? "—"} />
          <InfoRow
            label="Priority"
            value={
              <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-medium ${priority.className}`}>
                {priority.label}
              </span>
            }
          />
          <InfoRow
            label="Status"
            value={
              <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-medium ${status.className}`}>
                {status.label}
              </span>
            }
          />
          <InfoRow label="Ticket ID" value={`#${conversation.ticketNo}`} />
          {conversation.assignedAgent && (
            <InfoRow label="Assigned To" value={conversation.assignedAgent.name} />
          )}
        </div>
      </Section>

      <Section title="Recent Orders">
        {customer.recentOrders.length === 0 ? (
          <p className="text-[11.5px] text-[#9aa1b1]">
            {customer.userId
              ? "No orders on this account yet."
              : "Match this person to an account to see their orders."}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {customer.recentOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-[#e8eaf0] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-medium text-[#1b2033]">
                      {order.orderNo}
                    </span>
                    <span
                      className={`shrink-0 text-[11px] font-medium ${ORDER_STATUS_TONE(order.status)}`}
                    >
                      {prettyEnum(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#8b93a7]">
                    {shortDate(order.placedAt)} · {tk(order.total)}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/admin/orders"
              className="mt-3 block rounded-lg border border-[#e0e3ea] py-2 text-center text-[12px] font-medium text-[#3d4459] transition-colors hover:bg-[#f7f8fb]"
            >
              View All Orders
            </Link>
          </>
        )}
      </Section>

      <Section
        title="Tags"
        defaultOpen={conversation.tags.length > 0}
        action={
          <button
            type="button"
            aria-label="Add a tag"
            onClick={() => setAdding((open) => !open)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8b93a7] transition-colors hover:bg-[#f2effe] hover:text-[#6d4ee6]"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        }
      >
        {adding && (
          <div className="mb-2 flex gap-1.5">
            <input
              value={tagInput}
              autoFocus
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitTag();
                if (event.key === "Escape") setAdding(false);
              }}
              placeholder="Tag name"
              className="h-7 flex-1 rounded-md border border-[#e0e3ea] px-2 text-[11.5px] outline-none focus:border-[#6d4ee6]"
            />
            <button
              type="button"
              onClick={() => void submitTag()}
              disabled={busy || !tagInput.trim()}
              className="h-7 rounded-md bg-[#6d4ee6] px-2.5 text-[11px] font-medium text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        {conversation.tags.length === 0 ? (
          <p className="text-[11.5px] text-[#9aa1b1]">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {conversation.tags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 rounded-full bg-[#f2effe] px-2.5 py-1 text-[10.5px] font-medium text-[#6d4ee6]"
              >
                {tag.name}
                <button
                  type="button"
                  aria-label={`Remove ${tag.name}`}
                  onClick={() => void onRemoveTag(tag.id)}
                  className="text-[#a294ef] hover:text-[#6d4ee6]"
                >
                  <XIcon className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section title="Previous Conversations" defaultOpen={false}>
        {detail.previousConversations.length === 0 ? (
          <p className="text-[11.5px] text-[#9aa1b1]">
            This is their first conversation with us.
          </p>
        ) : (
          <div className="space-y-1.5">
            {detail.previousConversations.map((previous) => {
              const meta = CHANNEL_META[previous.channel];
              const tone = STATUS_BADGE[previous.status];

              return (
                <button
                  key={previous.id}
                  type="button"
                  onClick={() => onOpenConversation(previous.id)}
                  className="w-full rounded-lg border border-[#e8eaf0] px-3 py-2 text-left transition-colors hover:border-[#c9bcf7] hover:bg-[#faf9ff]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${meta.tint}`}
                      >
                        <meta.Icon className="h-2 w-2" />
                      </span>
                      <span className="truncate text-[11.5px] font-medium text-[#1b2033]">
                        {previous.ticketNo}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-medium ${tone.className}`}
                    >
                      {tone.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[#8b93a7]">
                    {previous.lastMessagePreview || "No messages"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#a3a9b8]">
                    {shortDate(previous.lastMessageAt)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Section>
      </div>
    </div>
  );
}
