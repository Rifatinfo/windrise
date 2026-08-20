"use client";
import { useEffect, useRef, useState } from "react";
import {
  AtSignIcon,
  CameraIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import type { Admin } from "@/types/admin";
import { adminAvatarTone, adminInitials } from "@/types/admin";

function resolveAvatarUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${trimmed}`;
}

export interface AdminFormPayload {
  name: string;
  email: string;
  password?: string;
  file?: File | null;
}

interface AdminFormDialogProps {
  admin: Admin | null;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (payload: AdminFormPayload) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-slate-50 pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors duration-150 focus:border-brand focus:bg-surface";

export function AdminFormDialog({
  admin,
  submitting,
  error,
  onClose,
  onSubmit,
  roleLabel = "Admin",
}: AdminFormDialogProps & { roleLabel?: string }) {
  const isCreate = !admin;
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
    return undefined;
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setFieldError("Name must be at least 2 characters long");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldError("Enter a valid email address");
      return;
    }
    if (isCreate && password.length < 6) {
      setFieldError("Password must be at least 6 characters long");
      return;
    }

    setFieldError("");
    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      ...(isCreate && { password }),
      file,
    });
  };

  const existingAvatar = admin ? resolveAvatarUrl(admin.avatar) : null;
  const showPreview = preview ?? existingAvatar;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isCreate ? `Create a new ${roleLabel.toLowerCase()}` : `Edit ${admin?.name ?? roleLabel.toLowerCase()}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">
              {isCreate ? `Add ${roleLabel}` : `Edit ${roleLabel}`}
            </h2>
            <p className="text-xs text-ink-muted">
              {isCreate
                ? `Create a new ${roleLabel.toLowerCase()} account for the store.`
                : `Update the details of this ${roleLabel.toLowerCase()} account.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors duration-150 hover:bg-slate-100 hover:text-ink"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-4">
            {showPreview ? (
              <img
                src={showPreview}
                alt="Admin avatar preview"
                className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
              />
            ) : admin ? (
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${adminAvatarTone(admin)}`}
              >
                {adminInitials(admin)}
              </span>
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-400">
                <UserIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300 disabled:opacity-60"
              >
                <CameraIcon className="h-4 w-4" aria-hidden="true" />
                {file ? "Change Avatar" : "Upload Avatar"}
              </button>
              <p className="mt-1.5 text-xs text-ink-muted">
                PNG, JPG or WebP · max 5MB
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="admin-name" className="mb-1.5 block text-xs font-medium text-ink">
              Name
            </label>
            <div className="relative">
              <UserIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                aria-hidden="true"
              />
              <input
                id="admin-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Admin name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-ink">
              Email
            </label>
            <div className="relative">
              <MailIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                aria-hidden="true"
              />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@windrise.com"
                className={inputClass}
              />
            </div>
          </div>

          {isCreate && (
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {admin && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-ink-muted">
              <AtSignIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Password changes are handled from the profile reset flow.
            </div>
          )}

          {(fieldError || error) && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {fieldError || error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand/90 disabled:opacity-60"
          >
            {submitting && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isCreate ? "Create Admin" : "Update Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
