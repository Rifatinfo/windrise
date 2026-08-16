"use client";
import { useEffect } from "react";
import {
  AtSignIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  IdCardIcon,
  MailIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  WalletCardsIcon,
  XIcon,
} from "lucide-react";
import type { Customer, CustomerStats } from "@/types/customer";
import {
  customerTier,
  CUSTOMER_TIER_META,
  USER_STATUS_META,
} from "@/types/customer";
import { formatBdt } from "@/utils/format";
import { CustomerAvatar } from "./CustomerAvatar";

function formatDateTime(input: string | Date): string {
  if (!input) return "-";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CustomerDetailDialogProps {
  customer: Customer | null;
  stats: CustomerStats;
  onClose: () => void;
}

export function CustomerDetailDialog({
  customer,
  stats,
  onClose,
}: CustomerDetailDialogProps) {
  useEffect(() => {
    if (!customer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [customer, onClose]);

  if (!customer) return null;

  const status = USER_STATUS_META[customer.status];
  const tier = customerTier(stats.spent);
  const tierMeta = CUSTOMER_TIER_META[tier];
  const displayName = customer.name?.trim() || "Unnamed Customer";
  const displayEmail = customer.email?.trim() || "No email";

  const rows: { icon: typeof UserIcon; label: string; value: string; mono?: boolean }[] = [
    { icon: IdCardIcon, label: "Customer ID", value: customer.id, mono: true },
    { icon: AtSignIcon, label: "Slug", value: customer.slug ?? "-", mono: true },
    { icon: UserIcon, label: "Role", value: customer.role.replace("_", " ") },
    { icon: ShoppingBagIcon, label: "Orders", value: String(stats.orders) },
    { icon: WalletCardsIcon, label: "Total Spent", value: formatBdt(stats.spent) },
    { icon: TagIcon, label: "Tier", value: tierMeta.label },
    { icon: CalendarIcon, label: "Joined", value: formatDateTime(customer.createdAt) },
    { icon: CalendarIcon, label: "Last Updated", value: formatDateTime(customer.updatedAt) },
    {
      icon: CheckCircle2Icon,
      label: "Password Change",
      value: customer.needPasswordChange ? "Required" : "Not required",
    },
    { icon: ClipboardListIcon, label: "Account Status", value: status.label },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Customer details for ${displayName}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-brand to-violet-600 px-6 pb-10 pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="absolute right-4 top-4 cursor-pointer rounded-lg bg-white/15 p-1.5 text-white transition-colors duration-150 hover:bg-white/25"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-4">
            <CustomerAvatar customer={customer} size="lg" className="border-2 border-white/60" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">{displayName}</h2>
              <p className="truncate text-sm text-white/80">{displayEmail}</p>
            </div>
          </div>
        </div>

        <div className="-mt-6 px-6 pb-6">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tierMeta.chip}`}>
              {tierMeta.label}
            </span>
            <span className="ml-auto text-right">
              <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                Total Spent
              </span>
              <span className="block text-sm font-semibold tabular-nums text-ink">
                {formatBdt(stats.spent)}
              </span>
            </span>
          </div>

          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 bg-surface px-4 py-2.5">
                <span className="rounded-md bg-slate-100 p-1.5 text-ink-soft">
                  <row.icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <dt className="w-32 shrink-0 text-xs font-medium text-ink-muted">{row.label}</dt>
                <dd
                  className={`min-w-0 flex-1 truncate text-right text-sm text-ink ${row.mono ? "font-mono tabular-nums text-[13px]" : "font-medium"}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={`mailto:${customer.email ?? ""}`}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-3.5 text-sm font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand/90"
          >
            <MailIcon className="h-4 w-4" aria-hidden="true" />
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
}
