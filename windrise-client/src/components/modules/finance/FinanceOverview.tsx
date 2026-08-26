"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeDollarSignIcon,
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  PercentIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
  Trash2Icon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import { FieldSelect } from "@/components/ui/field-select";
import {
  createCategory,
  createInvestment,
  deleteCategory,
  deleteInvestment,
  getCategories,
  getInvestments,
  getOverview,
  getProductOptions,
  setRevenue,
  updateInvestment,
  type ExpenseCategory,
  type FinanceOverview as Overview,
  type Investment,
  type ProductOption,
} from "@/services/finance/finance";

const TK = "৳";

const money = (value: number) =>
  `${TK}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const percent = (value: number | null) =>
  value === null ? "—" : `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

/** "2026-08" for today, which is what every endpoint here expects. */
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const todayValue = () => new Date().toISOString().slice(0, 10);

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400";

const labelClass = "mb-1.5 block text-[12px] font-medium text-slate-600";

type FormState = {
  categoryId: string;
  productId: string;
  amount: string;
  description: string;
  vendor: string;
  spentAt: string;
};

const emptyForm = (): FormState => ({
  categoryId: "",
  productId: "",
  amount: "",
  description: "",
  vendor: "",
  spentAt: todayValue(),
});

type TooltipEntry = { dataKey: string; name: string; value: number; color: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 text-slate-500">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
            style={{ background: entry.color }}
          />
          {entry.name}: {money(entry.value)}
        </p>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof WalletIcon;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-[22px] font-semibold leading-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}

export function FinanceOverview() {
  const [month, setMonth] = useState(currentMonth());
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [log, setLog] = useState<Investment[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [saving, setSaving] = useState(false);

  const [managingCategories, setManagingCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");

  const [filterCategory, setFilterCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const [editingRevenue, setEditingRevenue] = useState(false);
  const [revenueDraft, setRevenueDraft] = useState("");

  /** Bumped after any write so every panel refetches together. */
  const [reloadToken, setReloadToken] = useState(0);

  const reload = () => setReloadToken((token) => token + 1);

  /**
   * Everything the current view depends on, as one key. Comparing it with the
   * key the data came back under gives a loading flag without setting state
   * inside the effect body.
   */
  const requestKey = `${month}|${filterCategory}|${search.trim()}|${reloadToken}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getOverview(month),
      getCategories(),
      getProductOptions(),
      getInvestments({ month, categoryId: filterCategory, searchTerm: search.trim() }),
    ])
      .then(([overviewRes, categoryRes, productRes, logRes]) => {
        if (cancelled) return;
        setOverview(overviewRes.data);
        setCategories(categoryRes.data);
        setProducts(productRes.data);
        setLog(logRes.data);
        setLoadedKey(requestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadedKey(requestKey);
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load the finance data",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [month, filterCategory, search, requestKey]);

  const categoryOptions = useMemo(
    () => categories.map((entry) => ({ value: entry.id, label: entry.name })),
    [categories]
  );

  const productOptions = useMemo(
    () => [
      { value: "NONE", label: "Not tied to a product" },
      ...products.map((entry) => ({ value: entry.id, label: `${entry.sku} — ${entry.name}` })),
    ],
    [products]
  );

  const filterOptions = useMemo(
    () => [{ value: "ALL", label: "All categories" }, ...categoryOptions],
    [categoryOptions]
  );

  // ---- Investment / expense form -----------------------------------------

  const startEdit = (entry: Investment) => {
    setEditing(entry);
    setForm({
      categoryId: entry.categoryId,
      productId: entry.productId ?? "NONE",
      amount: String(entry.amount),
      description: entry.description,
      vendor: entry.vendor ?? "",
      spentAt: entry.spentAt.slice(0, 10),
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSubmit = async () => {
    const amount = Number(form.amount);

    if (!form.categoryId) {
      Toast.fire({ icon: "error", title: "Pick a category" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Toast.fire({ icon: "error", title: "Enter an amount greater than zero" });
      return;
    }
    if (!form.description.trim()) {
      Toast.fire({ icon: "error", title: "Add a short description" });
      return;
    }

    const payload = {
      amount,
      description: form.description.trim(),
      spentAt: new Date(`${form.spentAt}T00:00:00`).toISOString(),
      vendor: form.vendor.trim() || null,
      categoryId: form.categoryId,
      productId: form.productId === "NONE" ? null : form.productId || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateInvestment(editing.id, payload);
        Toast.fire({ icon: "success", title: "Entry updated" });
      } else {
        await createInvestment(payload);
        Toast.fire({ icon: "success", title: "Cost logged" });
      }
      cancelEdit();
      reload();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't save the entry",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entry: Investment) => {
    if (!window.confirm(`Delete "${entry.description}" (${money(entry.amount)})?`)) return;
    try {
      await deleteInvestment(entry.id);
      if (editing?.id === entry.id) cancelEdit();
      Toast.fire({ icon: "success", title: "Entry deleted" });
      reload();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete the entry",
      });
    }
  };

  // ---- Categories ---------------------------------------------------------

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const created = await createCategory(name, newCategoryColor);
      setNewCategory("");
      setForm((state) => ({ ...state, categoryId: created.data.id }));
      Toast.fire({ icon: "success", title: `"${name}" added` });
      reload();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't add the category",
      });
    }
  };

  const handleDeleteCategory = async (category: ExpenseCategory) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    try {
      await deleteCategory(category.id);
      if (form.categoryId === category.id) setForm((state) => ({ ...state, categoryId: "" }));
      if (filterCategory === category.id) setFilterCategory("ALL");
      Toast.fire({ icon: "success", title: "Category deleted" });
      reload();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete the category",
      });
    }
  };

  // ---- Revenue override ---------------------------------------------------

  const handleSaveRevenue = async () => {
    const amount = Number(revenueDraft);
    if (!Number.isFinite(amount) || amount < 0) {
      Toast.fire({ icon: "error", title: "Enter a valid revenue figure" });
      return;
    }
    try {
      await setRevenue(month, amount);
      setEditingRevenue(false);
      Toast.fire({ icon: "success", title: "Revenue updated" });
      reload();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't update revenue",
      });
    }
  };

  const logTotal = log.reduce((total, entry) => total + entry.amount, 0);
  const spentCategories = (overview?.byCategory ?? []).filter((row) => row.amount > 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900 sm:text-[24px]">
            Financial Overview
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Investment, revenue and profitability for {monthLabel(month)}.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-slate-600">
          <span className="hidden sm:inline">Month</span>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value || currentMonth())}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none focus:border-indigo-400"
          />
        </label>
      </div>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Investment"
          value={money(overview?.totalInvestment ?? 0)}
          hint="Everything logged this month"
          icon={WalletIcon}
          tone="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Revenue"
          value={money(overview?.revenue ?? 0)}
          hint={
            overview?.revenueIsManual
              ? `Set manually — orders show ${money(overview.actualOrderRevenue)}`
              : "From paid & delivered orders"
          }
          icon={BadgeDollarSignIcon}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Gross Profit"
          value={money(overview?.grossProfit ?? 0)}
          hint="Revenue minus investment"
          icon={TrendingUpIcon}
          tone={
            (overview?.grossProfit ?? 0) < 0 ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-600"
          }
        />
        <StatCard
          label="ROI"
          value={percent(overview?.roi ?? null)}
          hint="Return on the money spent"
          icon={PercentIcon}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Profit Margin"
          value={percent(overview?.profitMargin ?? null)}
          hint="Profit as a share of revenue"
          icon={ReceiptTextIcon}
          tone="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Chart + category split */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Revenue vs Investment</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">Last six months</p>
            </div>
            {editingRevenue ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={revenueDraft}
                  onChange={(event) => setRevenueDraft(event.target.value)}
                  placeholder="Revenue"
                  className="h-9 w-32 rounded-lg border border-slate-200 px-2 text-[13px] outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={handleSaveRevenue}
                  aria-label="Save revenue"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b0b0b] text-white"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRevenue(false)}
                  aria-label="Cancel revenue edit"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRevenueDraft(String(overview?.revenue ?? 0));
                  setEditingRevenue(true);
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Set this month&apos;s revenue
              </button>
            )}
          </div>

          <div className="mt-4 h-[260px] w-full">
            {overview &&
            overview.series.some((point) => point.revenue > 0 || point.investment > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.series} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                    }
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: "#64748b" }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="investment" name="Investment" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-[13px] text-slate-400">
                {loading ? "Loading…" : "Nothing recorded in this period yet"}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Investment by Category</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Where this month&apos;s money went</p>

          <div className="mt-4 space-y-3">
            {spentCategories.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-slate-400">
                No costs logged for {monthLabel(month)}.
              </p>
            ) : (
              spentCategories.map((row) => (
                <div key={row.id}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: row.color }}
                      />
                      {row.name}
                    </span>
                    <span className="font-medium text-slate-900">{money(row.amount)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(row.percent, 2)}%`, background: row.color }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-slate-400">
                    {row.percent.toFixed(1)}% of spend
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form + log */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Add / edit */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold text-slate-900">
              {editing ? "Edit Entry" : "Add Investment / Expense"}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[12px] font-medium text-slate-500 underline-offset-2 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Category</label>
                <button
                  type="button"
                  onClick={() => setManagingCategories((open) => !open)}
                  className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <SettingsIcon className="h-3 w-3" />
                  {managingCategories ? "Done" : "Manage"}
                </button>
              </div>
              <FieldSelect
                label="Category"
                placeholder="Choose a category"
                value={form.categoryId}
                onValueChange={(value) => setForm((state) => ({ ...state, categoryId: value }))}
                options={categoryOptions}
              />

              {managingCategories && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleAddCategory();
                        }
                      }}
                      placeholder="New category name"
                      className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] outline-none focus:border-indigo-400"
                    />
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(event) => setNewCategoryColor(event.target.value)}
                      aria-label="Category colour"
                      className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      aria-label="Add category"
                      className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b0b0b] text-white transition hover:bg-black"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <ul className="mt-2.5 max-h-40 space-y-1 overflow-y-auto">
                    {categories.map((category) => (
                      <li
                        key={category.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1.5"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-[12px] text-slate-700">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: category.color }}
                          />
                          <span className="truncate">{category.name}</span>
                          {category.investmentCount > 0 && (
                            <span className="shrink-0 text-[11px] text-slate-400">
                              ({category.investmentCount})
                            </span>
                          )}
                        </span>
                        {category.isSystem ? (
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-300">
                            built-in
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            aria-label={`Delete ${category.name}`}
                            className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Built-in categories stay put. A category still in use has to be emptied before
                    it can be deleted.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Linked SKU (optional)</label>
              <FieldSelect
                label="Linked SKU"
                placeholder="Not tied to a product"
                value={form.productId}
                onValueChange={(value) => setForm((state) => ({ ...state, productId: value }))}
                options={productOptions}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Attribute this cost to a product so its true margin stays visible.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Amount ({TK})</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, amount: event.target.value }))
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={form.spentAt}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, spentAt: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((state) => ({ ...state, description: event.target.value }))
                }
                placeholder="e.g. Fabric order for the winter batch"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Vendor / paid to (optional)</label>
              <input
                value={form.vendor}
                onChange={(event) => setForm((state) => ({ ...state, vendor: event.target.value }))}
                placeholder="e.g. Dhaka Textiles Ltd."
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b0b0b] text-[13px] font-medium text-white transition hover:bg-black disabled:opacity-60"
            >
              {saving ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              {editing ? "Save changes" : "Add to log"}
            </button>
          </div>
        </div>

        {/* Investment log */}
        <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Investment Log</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {log.length} {log.length === 1 ? "entry" : "entries"} · {money(logTotal)}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search entries"
                  className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[12px] outline-none focus:border-indigo-400 sm:w-48"
                />
              </div>
              <FieldSelect
                label="Filter by category"
                value={filterCategory}
                onValueChange={setFilterCategory}
                options={filterOptions}
                triggerClassName="h-9 text-[12px] sm:w-44"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Linked SKU</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {log.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-slate-400">
                      {loading ? "Loading…" : "No entries match this view."}
                    </td>
                  </tr>
                ) : (
                  log.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-50 text-[13px] last:border-0 ${
                        editing?.id === entry.id ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(entry.spentAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{entry.description}</p>
                        {entry.vendor && (
                          <p className="mt-0.5 text-[11px] text-slate-400">{entry.vendor}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: `${entry.category.color}1a`,
                            color: entry.category.color,
                          }}
                        >
                          {entry.category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {entry.product ? (
                          <span
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600"
                            title={entry.product.name}
                          >
                            {entry.product.sku}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                        {money(entry.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            aria-label={`Edit ${entry.description}`}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry)}
                            aria-label={`Delete ${entry.description}`}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
