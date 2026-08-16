export type UserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type ServerUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
  role: string;
  status: UserStatus;
  isDeleted: boolean;
  needPasswordChange: boolean;
  slug?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = ServerUser;

export type CustomerTier = "new" | "regular" | "silver" | "gold" | "platinum";

export type CustomerStats = {
  orders: number;
  spent: number;
};

export const USER_STATUS_META: Record<
  UserStatus,
  { label: string; dot: string; chip: string; bar: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  DELETED: {
    label: "Deleted",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700",
    bar: "bg-rose-500",
  },
};

export const CUSTOMER_TIER_META: Record<
  CustomerTier,
  { label: string; chip: string }
> = {
  new: { label: "New", chip: "bg-slate-100 text-slate-600" },
  regular: { label: "Regular", chip: "bg-blue-50 text-blue-700" },
  silver: { label: "Silver", chip: "bg-slate-100 text-slate-700" },
  gold: { label: "Gold", chip: "bg-amber-50 text-amber-700" },
  platinum: { label: "Platinum", chip: "bg-violet-50 text-violet-700" },
};

export function customerTier(spent: number): CustomerTier {
  if (spent <= 0) return "new";
  if (spent < 5000) return "regular";
  if (spent < 20000) return "silver";
  if (spent < 100000) return "gold";
  return "platinum";
}

const AVATAR_TONES = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-cyan-100 text-cyan-700",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function customerAvatarTone(customer: Customer): string {
  const key = customer.email ?? customer.name ?? customer.id;
  return AVATAR_TONES[hashString(key) % AVATAR_TONES.length];
}

export function customerInitials(customer: Customer): string {
  const source = customer.name?.trim() ?? customer.email?.trim() ?? "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}
