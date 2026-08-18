"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

import { SectionCard } from "@/components/modules/dashboard/SectionCard";
import { formatTk } from "@/components/modules/dashboard/dashboard.utils";
import {
  createCoupon,
  deactivateCoupon,
  getAllCoupons,
  type CreateCouponPayload,
} from "@/services/coupon/coupon";
import type { Coupon } from "@/types/stats";

const EMPTY_FORM: CreateCouponPayload = {
  code: "",
  type: "PERCENTAGE",
  value: 10,
  minOrderAmount: undefined,
  maxDiscount: undefined,
  usageLimit: undefined,
  startDate: undefined,
  endDate: undefined,
};

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCouponPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getAllCoupons()
      .then((res) => setCoupons(res))
      .catch(() => setCoupons([]));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!form.code.trim() || !form.value) return;
    setSaving(true);
    setError("");
    try {
      await createCoupon({
        ...form,
        code: form.code.trim(),
        minOrderAmount: form.minOrderAmount || undefined,
        maxDiscount: form.maxDiscount || undefined,
        usageLimit: form.usageLimit || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggleDeactivate = async (id: string) => {
    try {
      await deactivateCoupon(id);
      load();
    } catch {
      // surfaced implicitly — list simply won't update
    }
  };

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-5 pb-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Coupons</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Coupons</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            New Coupon
          </button>
        </header>

        {showForm && (
          <SectionCard title="Create Coupon">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="text-xs font-medium text-ink-soft">
                Code
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                  placeholder="SUMMER20"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount (৳)</option>
                </select>
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Value
                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Min. Order Amount
                <input
                  type="number"
                  min={0}
                  value={form.minOrderAmount ?? ""}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Max Discount
                <input
                  type="number"
                  min={0}
                  value={form.maxDiscount ?? ""}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Usage Limit
                <input
                  type="number"
                  min={0}
                  value={form.usageLimit ?? ""}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                Start Date
                <input
                  type="date"
                  value={form.startDate ?? ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value || undefined })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
              <label className="text-xs font-medium text-ink-soft">
                End Date
                <input
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
                />
              </label>
            </div>
            {error && <p className="mt-3 text-xs text-bad">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-canvas px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </SectionCard>
        )}

        <SectionCard title="All Coupons">
          {coupons === null ? (
            <div className="h-[200px] animate-pulse rounded-xl bg-canvas" />
          ) : coupons.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">No coupons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-muted">
                    <th className="pb-2 pr-3 font-medium">Code</th>
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 pr-3 font-medium">Value</th>
                    <th className="pb-2 pr-3 font-medium">Used</th>
                    <th className="pb-2 pr-3 font-medium">Orders</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-line/60 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-ink">{c.code}</td>
                      <td className="py-2.5 pr-3 text-ink-soft">{c.type === "PERCENTAGE" ? "Percentage" : "Fixed"}</td>
                      <td className="py-2.5 pr-3 text-ink-soft">
                        {c.type === "PERCENTAGE" ? `${c.value}%` : formatTk(c.value)}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-soft">
                        {c.usedCount}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-soft">{c._count?.orders ?? 0}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isActive ? "bg-emerald-50 text-good" : "bg-canvas text-ink-muted"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {c.isActive && (
                          <button
                            type="button"
                            onClick={() => toggleDeactivate(c.id)}
                            className="text-xs font-medium text-brand hover:underline"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
