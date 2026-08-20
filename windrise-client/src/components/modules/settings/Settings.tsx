"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  BoxesIcon,
  CheckIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  RotateCcwIcon,
  StoreIcon,
  TruckIcon,
  UserRoundIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Toast } from "@/components/shared/Toast/Toast";
import { SectionCard } from "@/components/modules/dashboard/SectionCard";
import { getStoreSettings, updateStoreSettings } from "@/services/settings/settings";
import type { StoreSettings } from "@/types/settings";
import {
  PrefixedInput,
  SettingsField,
  settingsInputClass,
  ToggleRow,
} from "./SettingsField";

type TabId = "store" | "shipping" | "inventory" | "notifications" | "account";

const TABS: { id: TabId; label: string; icon: typeof StoreIcon }[] = [
  { id: "store", label: "Store", icon: StoreIcon },
  { id: "shipping", label: "Shipping", icon: TruckIcon },
  { id: "inventory", label: "Inventory", icon: BoxesIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "account", label: "Account", icon: UserRoundIcon },
];

export function Settings() {
  const { user, loading: authLoading } = useAuth();
  const canEdit = user?.role === "ADMIN";

  const [tab, setTab] = useState<TabId>("store");
  const [saved, setSaved] = useState<StoreSettings | null>(null);
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getStoreSettings()
      .then((data) => {
        if (cancelled) return;
        setSaved(data);
        setDraft(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load settings");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only send what actually changed, so one section's save can't clobber another.
  const changed = useMemo(() => {
    if (!saved || !draft) return {} as Partial<StoreSettings>;
    const diff: Record<string, unknown> = {};
    for (const key of Object.keys(draft) as (keyof StoreSettings)[]) {
      if (key === "id" || key === "updatedAt") continue;
      if (draft[key] !== saved[key]) diff[key] = draft[key];
    }
    return diff as Partial<StoreSettings>;
  }, [saved, draft]);

  const dirty = Object.keys(changed).length > 0;

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const validate = (): boolean => {
    if (!draft) return false;
    const next: Record<string, string> = {};

    if (!draft.storeName.trim()) next.storeName = "Store name is required.";
    if (draft.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.supportEmail)) {
      next.supportEmail = "Enter a valid email address.";
    }
    for (const key of [
      "shippingDhakaCity",
      "shippingDhakaSuburb",
      "shippingOutsideDhaka",
    ] as const) {
      if (!Number.isFinite(draft[key]) || draft[key] < 0) {
        next[key] = "Enter a rate of zero or more.";
      }
    }
    if (
      draft.freeShippingThreshold !== null &&
      (!Number.isFinite(draft.freeShippingThreshold) || draft.freeShippingThreshold < 0)
    ) {
      next.freeShippingThreshold = "Enter an amount of zero or more.";
    }
    if (!Number.isInteger(draft.lowStockThreshold) || draft.lowStockThreshold < 1) {
      next.lowStockThreshold = "Must be a whole number of at least 1.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!draft || !dirty || !validate()) return;
    setSaving(true);
    try {
      const updated = await updateStoreSettings(changed);
      setSaved(updated);
      setDraft(updated);
      Toast.fire({ icon: "success", title: "Settings saved." });
    } catch (err: unknown) {
      Toast.fire({
        icon: "error",
        title: err instanceof Error ? err.message : "Could not save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(saved);
    setErrors({});
  };

  if (authLoading || (!draft && !loadError)) {
    return (
      <main className="min-h-full w-full px-4 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 py-16 text-sm text-ink-muted">
          <Loader2Icon className="h-4 w-4 animate-spin" /> Loading settings…
        </div>
      </main>
    );
  }

  if (loadError || !draft) {
    return (
      <main className="min-h-full w-full px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError || "Settings unavailable."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-5 pb-28">
        <header>
          <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
            Dashboards / <span className="font-medium text-ink">Settings</span>
          </nav>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Settings</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Store details, delivery rates, stock thresholds and notifications.
          </p>
        </header>

        {!canEdit && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              You can view these settings, but only an administrator can change them.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 shadow-card"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-muted hover:bg-slate-50 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {tab === "store" && (
          <SectionCard
            title="Store profile"
            subtitle="Shown to customers on order emails and invoices"
          >
            <div className="grid gap-4 @lg:grid-cols-2">
              <SettingsField label="Store name" htmlFor="storeName" error={errors.storeName}>
                <input
                  id="storeName"
                  value={draft.storeName}
                  disabled={!canEdit}
                  onChange={(e) => set("storeName", e.target.value)}
                  className={settingsInputClass}
                />
              </SettingsField>

              <SettingsField
                label="Support email"
                htmlFor="supportEmail"
                hint="Where customers reply with order questions."
                error={errors.supportEmail}
              >
                <input
                  id="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  value={draft.supportEmail ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => set("supportEmail", e.target.value || null)}
                  className={settingsInputClass}
                />
              </SettingsField>

              <SettingsField label="Support phone" htmlFor="supportPhone">
                <input
                  id="supportPhone"
                  placeholder="01XXXXXXXXX"
                  value={draft.supportPhone ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => set("supportPhone", e.target.value || null)}
                  className={settingsInputClass}
                />
              </SettingsField>

              <SettingsField
                label="Order number prefix"
                htmlFor="orderNumberPrefix"
                hint="Appears before order numbers, e.g. #205750."
              >
                <input
                  id="orderNumberPrefix"
                  maxLength={8}
                  value={draft.orderNumberPrefix}
                  disabled={!canEdit}
                  onChange={(e) => set("orderNumberPrefix", e.target.value)}
                  className={settingsInputClass}
                />
              </SettingsField>

              <div className="@lg:col-span-2">
                <SettingsField label="Store address" htmlFor="storeAddress">
                  <textarea
                    id="storeAddress"
                    rows={2}
                    placeholder="Street, city, country"
                    value={draft.storeAddress ?? ""}
                    disabled={!canEdit}
                    onChange={(e) => set("storeAddress", e.target.value || null)}
                    className={cn(settingsInputClass, "h-auto py-2")}
                  />
                </SettingsField>
              </div>
            </div>
          </SectionCard>
        )}

        {tab === "shipping" && (
          <SectionCard
            title="Delivery rates"
            subtitle="Charged at checkout based on the customer's delivery zone"
          >
            <div className="grid gap-4 @lg:grid-cols-3">
              <SettingsField
                label="Inside Dhaka"
                htmlFor="shippingDhakaCity"
                error={errors.shippingDhakaCity}
              >
                <PrefixedInput
                  id="shippingDhakaCity"
                  prefix="৳"
                  type="number"
                  min={0}
                  value={draft.shippingDhakaCity}
                  disabled={!canEdit}
                  onChange={(e) => set("shippingDhakaCity", Number(e.target.value))}
                />
              </SettingsField>

              <SettingsField
                label="Dhaka suburb"
                htmlFor="shippingDhakaSuburb"
                error={errors.shippingDhakaSuburb}
              >
                <PrefixedInput
                  id="shippingDhakaSuburb"
                  prefix="৳"
                  type="number"
                  min={0}
                  value={draft.shippingDhakaSuburb}
                  disabled={!canEdit}
                  onChange={(e) => set("shippingDhakaSuburb", Number(e.target.value))}
                />
              </SettingsField>

              <SettingsField
                label="Outside Dhaka"
                htmlFor="shippingOutsideDhaka"
                error={errors.shippingOutsideDhaka}
              >
                <PrefixedInput
                  id="shippingOutsideDhaka"
                  prefix="৳"
                  type="number"
                  min={0}
                  value={draft.shippingOutsideDhaka}
                  disabled={!canEdit}
                  onChange={(e) => set("shippingOutsideDhaka", Number(e.target.value))}
                />
              </SettingsField>

              <div className="@lg:col-span-3">
                <SettingsField
                  label="Free delivery above"
                  htmlFor="freeShippingThreshold"
                  hint="Leave empty to always charge delivery."
                  error={errors.freeShippingThreshold}
                >
                  <div className="max-w-xs">
                    <PrefixedInput
                      id="freeShippingThreshold"
                      prefix="৳"
                      type="number"
                      min={0}
                      placeholder="No free delivery"
                      value={draft.freeShippingThreshold ?? ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        set(
                          "freeShippingThreshold",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </SettingsField>
              </div>
            </div>
          </SectionCard>
        )}

        {tab === "inventory" && (
          <SectionCard
            title="Stock thresholds"
            subtitle="Drives the Inventory page, low-stock alerts and dashboard warnings"
          >
            <div className="max-w-xs">
              <SettingsField
                label="Low stock threshold"
                htmlFor="lowStockThreshold"
                hint="A product at or below this many units is flagged as low stock."
                error={errors.lowStockThreshold}
              >
                <input
                  id="lowStockThreshold"
                  type="number"
                  min={1}
                  step={1}
                  value={draft.lowStockThreshold}
                  disabled={!canEdit}
                  onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
                  className={settingsInputClass}
                />
              </SettingsField>
            </div>
          </SectionCard>
        )}

        {tab === "notifications" && (
          <SectionCard
            title="Email notifications"
            subtitle="Which events send an email to customers or staff"
          >
            <div className="grid gap-3 @lg:grid-cols-2">
              <ToggleRow
                label="Order placed"
                description="Email the customer a confirmation when an order is placed."
                checked={draft.notifyOrderPlaced}
                disabled={!canEdit}
                onChange={(v) => set("notifyOrderPlaced", v)}
              />
              <ToggleRow
                label="Order status changes"
                description="Email the customer when an order is shipped or delivered."
                checked={draft.notifyOrderStatus}
                disabled={!canEdit}
                onChange={(v) => set("notifyOrderStatus", v)}
              />
              <ToggleRow
                label="Low stock alerts"
                description="Notify staff when a product drops to the threshold above."
                checked={draft.notifyLowStock}
                disabled={!canEdit}
                onChange={(v) => set("notifyLowStock", v)}
              />
            </div>
          </SectionCard>
        )}

        {tab === "account" && (
          <SectionCard
            title="Your account"
            subtitle="Personal details and sign-in security"
          >
            <div className="grid gap-3 @lg:grid-cols-2">
              <Link
                href="/my-profile"
                className="flex items-start gap-3 rounded-xl border border-line p-3.5 transition-colors hover:bg-slate-50"
              >
                <UserRoundIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-ink">Edit profile</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    Change your name, phone and profile photo.
                  </span>
                </span>
              </Link>

              <Link
                href="/my-profile"
                className="flex items-start gap-3 rounded-xl border border-line p-3.5 transition-colors hover:bg-slate-50"
              >
                <KeyRoundIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-ink">Change password</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    Update the password you use to sign in.
                  </span>
                </span>
              </Link>
            </div>

            <dl className="mt-4 grid gap-3 border-t border-line pt-4 @lg:grid-cols-3">
              <div>
                <dt className="text-xs text-ink-muted">Signed in as</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Role</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">{user?.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Settings last updated</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {new Date(draft.updatedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>
          </SectionCard>
        )}
      </div>

      {/* Save bar — only appears once something has actually changed. */}
      {canEdit && dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur duration-200 animate-in slide-in-from-bottom-2">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
            <p className="text-sm text-ink-muted">
              {Object.keys(changed).length} unsaved change
              {Object.keys(changed).length === 1 ? "" : "s"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={discard}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-slate-300 disabled:opacity-60"
              >
                <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-card transition-colors hover:bg-brand/90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                )}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
