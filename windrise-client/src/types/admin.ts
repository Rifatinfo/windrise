export type AdminStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Admin = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role: string;
  status: AdminStatus;
  isDeleted: boolean;
  needPasswordChange: boolean;
  slug?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_STATUS_META: Record<
  AdminStatus,
  { label: string; dot: string; chip: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700",
  },
  DELETED: {
    label: "Deleted",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700",
  },
};

const AVATAR_TONES = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function adminAvatarTone(admin: Admin): string {
  const key = admin.email ?? admin.name ?? admin.id;
  return AVATAR_TONES[hashString(key) % AVATAR_TONES.length];
}

export function adminInitials(admin: Admin): string {
  const source = admin.name?.trim() ?? admin.email?.trim() ?? "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}
