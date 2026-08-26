"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercentIcon,
  CalculatorIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  FactoryIcon,
  InfoIcon,
  LayersIcon,
  Loader2Icon,
  MegaphoneIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  PencilIcon,
  Trash2Icon,
  Share2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  TruckIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { FieldSelect } from "@/components/ui/field-select";
import {
  deleteTemplate,
  downloadPricingReport,
  getTemplates,
  saveTemplate,
  updateTemplate,
  type PricingTemplate,
} from "@/services/pricing/pricing";
import {
  buildTiers,
  calculatePricing,
  marginCeiling,
  MARGIN_MAX,
  type CostLine,
  type MarginMode,
  type PlatformFeeMode,
  type PricingInput,
} from "@/utils/pricing";

const CURRENCIES = [
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka (BDT)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR)" },
];

const STRATEGIES = [
  { value: "VALUE_BASED", label: "Value-Based" },
  { value: "COST_PLUS", label: "Cost-Plus" },
  { value: "COMPETITIVE", label: "Competitive" },
  { value: "PENETRATION", label: "Penetration" },
  { value: "PREMIUM", label: "Premium" },
];

/** The five cost rows the calculator always shows. */
const BASE_COSTS: { id: string; label: string; hint: string; icon: typeof FactoryIcon }[] = [
  { id: "production", label: "Production Cost", hint: "Manufacturing or sourcing cost per unit", icon: FactoryIcon },
  { id: "packaging", label: "Packaging Cost", hint: "Boxes, labels, polybags, etc.", icon: PackageIcon },
  { id: "marketing", label: "Marketing / Ad Cost", hint: "Per unit marketing expense", icon: MegaphoneIcon },
  { id: "shipping", label: "Shipping & Logistics Cost", hint: "Freight, courier, handling", icon: TruckIcon },
  { id: "other", label: "Other / Overhead Cost", hint: "Miscellaneous expenses", icon: WalletIcon },
];

const BREAKDOWN_COLORS = ["#6366f1", "#38bdf8", "#10b981", "#f59e0b", "#94a3b8"];

const DEFAULT_COSTS: CostLine[] = BASE_COSTS.map((row) => ({
  id: row.id,
  label: row.label,
  amount: 0,
}));

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400";

export function PricingCalculator() {
  // ---- Inputs -------------------------------------------------------------
  const [productName, setProductName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [costs, setCosts] = useState<CostLine[]>(DEFAULT_COSTS);

  const [platformFee, setPlatformFee] = useState(0);
  const [platformFeeMode, setPlatformFeeMode] = useState<PlatformFeeMode>("PERCENT");

  const [recommendedMargin, setRecommendedMargin] = useState(40);
  const [useCustomMargin, setUseCustomMargin] = useState(false);
  const [customMargin, setCustomMargin] = useState(40);
  const [marginMode, setMarginMode] = useState<MarginMode>("MARGIN");

  const [showAdvanced, setShowAdvanced] = useState(true);
  const [roundTo, setRoundTo] = useState(0);
  const [pricingStrategy, setPricingStrategy] = useState("VALUE_BASED");
  const [taxPercent, setTaxPercent] = useState(0);
  const [minSellingPrice, setMinSellingPrice] = useState<number | null>(null);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(0);
  const [priceVisibleToTeam, setPriceVisibleToTeam] = useState(true);

  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  /** Set while editing a saved pricing, so Save overwrites instead of adding. */
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const symbol = CURRENCIES.find((entry) => entry.code === currency)?.symbol ?? currency;
  const targetMargin = useCustomMargin ? customMargin : recommendedMargin;
  const ceiling = marginCeiling(useCustomMargin);

  // ---- Derived ------------------------------------------------------------

  const input: PricingInput = useMemo(
    () => ({
      costs,
      platformFee,
      platformFeeMode,
      marginMode,
      targetMargin,
      taxPercent,
      roundTo,
      minSellingPrice,
    }),
    [costs, platformFee, platformFeeMode, marginMode, targetMargin, taxPercent, roundTo, minSellingPrice]
  );

  const result = useMemo(() => calculatePricing(input), [input]);
  const tiers = useMemo(() => buildTiers(input, recommendedMargin), [input, recommendedMargin]);

  const money = (value: number, decimals = 0) =>
    `${symbol}${value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  // ---- Templates ----------------------------------------------------------

  const [reloadToken, setReloadToken] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getTemplates()
      .then((res) => !cancelled && setTemplates(res.data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /**
   * Load a saved pricing back into the form. `mode` decides whether the next
   * Save overwrites that row (edit) or creates a new one (apply as a starting
   * point).
   */
  const applyTemplate = (template: PricingTemplate, mode: "apply" | "edit" = "apply") => {
    setProductName(template.productName ?? "");
    setCurrency(template.currency);
    setCosts(template.costs.length > 0 ? template.costs : DEFAULT_COSTS);
    setPlatformFee(template.platformFee);
    setPlatformFeeMode(template.platformFeeMode);
    setMarginMode(template.marginMode);
    setRecommendedMargin(template.recommendedMargin);
    setCustomMargin(template.targetMargin);
    setUseCustomMargin(template.targetMargin !== template.recommendedMargin);
    setTaxPercent(template.taxPercent);
    setRoundTo(template.roundTo);
    setMinSellingPrice(template.minSellingPrice);
    setMaxDiscountPercent(template.maxDiscountPercent);
    setPricingStrategy(template.pricingStrategy);
    setTemplatesOpen(false);

    if (mode === "edit") {
      setEditing({ id: template.id, name: template.name });
      Toast.fire({ icon: "success", title: `Editing "${template.name}"` });
    } else {
      setEditing(null);
      Toast.fire({ icon: "success", title: `Applied "${template.name}"` });
    }
  };

  const payload = () => ({
    productName: productName || null,
    currency,
    costs,
    platformFee,
    platformFeeMode,
    marginMode,
    targetMargin,
    taxPercent,
    roundTo,
    minSellingPrice,
    maxDiscountPercent,
    pricingStrategy,
    recommendedMargin,
  });

  const handleSaveTemplate = async () => {
    // Editing overwrites the row it came from; otherwise ask for a name and
    // add a new one to the list.
    const name = editing
      ? editing.name
      : window.prompt("Name this pricing", productName || "New pricing")?.trim();

    if (!name) return;

    setSaving(true);
    try {
      if (editing) {
        await updateTemplate(editing.id, { name, ...payload() });
        Toast.fire({ icon: "success", title: `"${name}" updated` });
      } else {
        await saveTemplate({ name, ...payload() });
        Toast.fire({ icon: "success", title: `"${name}" saved` });
      }
      setReloadToken((token) => token + 1);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't save this pricing",
      });
    } finally {
      setSaving(false);
    }
  };

  /** Rename an existing saved pricing without touching its figures. */
  const handleRenameTemplate = async (template: PricingTemplate) => {
    const name = window.prompt("Rename this pricing", template.name)?.trim();
    if (!name || name === template.name) return;

    try {
      await updateTemplate(template.id, {
        name,
        productName: template.productName,
        currency: template.currency,
        costs: template.costs,
        platformFee: template.platformFee,
        platformFeeMode: template.platformFeeMode,
        marginMode: template.marginMode,
        targetMargin: template.targetMargin,
        taxPercent: template.taxPercent,
        roundTo: template.roundTo,
        minSellingPrice: template.minSellingPrice,
        maxDiscountPercent: template.maxDiscountPercent,
        pricingStrategy: template.pricingStrategy,
        recommendedMargin: template.recommendedMargin,
      });
      Toast.fire({ icon: "success", title: "Renamed" });
      if (editing?.id === template.id) setEditing({ id: template.id, name });
      setReloadToken((token) => token + 1);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't rename this pricing",
      });
    }
  };

  const handleDeleteTemplate = async (template: PricingTemplate) => {
    if (!window.confirm(`Delete the saved pricing "${template.name}"?`)) return;
    try {
      await deleteTemplate(template.id);
      Toast.fire({ icon: "success", title: "Deleted" });
      // Deleting the row being edited drops back to "new pricing" mode.
      if (editing?.id === template.id) setEditing(null);
      setReloadToken((token) => token + 1);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete this pricing",
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadPricingReport(payload());
      Toast.fire({ icon: "success", title: "Report downloaded" });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't build the report",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setEditing(null);
    setProductName("");
    setCosts(DEFAULT_COSTS);
    setPlatformFee(0);
    setPlatformFeeMode("PERCENT");
    setUseCustomMargin(false);
    setCustomMargin(recommendedMargin);
    setTaxPercent(0);
    setRoundTo(0);
    setMinSellingPrice(null);
    setMaxDiscountPercent(0);
    Toast.fire({ icon: "success", title: "Calculator reset" });
  };

  const setCost = (id: string, amount: number) =>
    setCosts((current) =>
      current.map((line) => (line.id === id ? { ...line, amount } : line))
    );

  const addCustomCost = () => {
    const label = window.prompt("What is this cost for?", "Custom cost");
    if (!label?.trim()) return;
    setCosts((current) => [
      ...current,
      { id: `custom-${Date.now()}`, label: label.trim(), amount: 0 },
    ]);
  };

  const removeCost = (id: string) =>
    setCosts((current) => current.filter((line) => line.id !== id));

  const marginDelta = Math.round(targetMargin - recommendedMargin);
  const potentialMonthly = result.profitPerUnit * 30;

  return (
    <div className="px-4 pb-10 lg:px-6">
      {/* Header */}
      <nav aria-label="Breadcrumb" className="text-[12px] text-slate-400">
        Dashboards / Products /{" "}
        <span className="font-medium text-slate-700">Pricing Calculator</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <CalculatorIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[24px] font-bold leading-tight text-slate-900">
              Pricing Calculator
            </h1>
            <p className="text-[13px] text-slate-500">
              Break down all real costs for a product and get a suggested selling price at
              your target margin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {editing ? `Update "${editing.name}"` : "Save Pricing"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                Toast.fire({ icon: "success", title: "Switched to a new pricing" });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <XIcon className="h-4 w-4" />
              Cancel edit
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {exporting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
            Export Report
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ============================== Inputs ============================== */}
        <div className="space-y-5">
          {/* 1. Cost inputs */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[12px] font-bold text-indigo-700">
                  1
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold text-slate-900">Cost Inputs</h2>
                  <p className="text-[12px] text-slate-500">
                    Enter all costs to calculate accurate pricing
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTemplatesOpen((open) => !open)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  <LayersIcon className="h-3.5 w-3.5" />
                  Apply from Template
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                </button>

                {templatesOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {templates.length === 0 && (
                      <p className="px-3 py-3 text-[12px] text-slate-500">
                        No templates yet — save one to reuse this setup.
                      </p>
                    )}
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => applyTemplate(template)}
                          className="min-w-0 flex-1 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <span className="block truncate text-[13px] font-medium text-slate-800">
                            {template.name}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {template.targetMargin}% ·{" "}
                            {template.costs.reduce((sum, line) => sum + line.amount, 0)} cost
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${template.name}`}
                          onClick={() => handleDeleteTemplate(template)}
                          className="rounded-md p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pc-name" className="text-[13px] font-medium text-slate-800">
                  Product Name
                </label>
                <input
                  id="pc-name"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="e.g. Twill Joggers — Batch #2"
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <div>
                <label htmlFor="pc-currency" className="text-[13px] font-medium text-slate-800">
                  Currency
                </label>
                <FieldSelect
                  label="Currency"
                  value={currency}
                  onValueChange={setCurrency}
                  options={CURRENCIES.map((entry) => ({
                    value: entry.code,
                    label: `${entry.symbol} ${entry.label}`,
                  }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Cost rows */}
            <div className="mt-5 space-y-3">
              {costs.map((line) => {
                const base = BASE_COSTS.find((row) => row.id === line.id);
                const Icon = base?.icon ?? SparklesIcon;
                return (
                  <div key={line.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-800">
                        {line.label}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {base?.hint ?? "Custom cost line"}
                      </p>
                    </div>
                    <div className="relative w-[150px] shrink-0 sm:w-[190px]">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        min={0}
                        aria-label={line.label}
                        value={line.amount === 0 ? "" : line.amount}
                        onChange={(event) => setCost(line.id, Number(event.target.value) || 0)}
                        placeholder="0"
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                    {base ? (
                      <span title={base.hint} className="shrink-0 text-slate-300">
                        <InfoIcon className="h-4 w-4" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${line.label}`}
                        onClick={() => removeCost(line.id)}
                        className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Platform fee — label above the controls, so the two inputs
                  never squeeze the text at narrow widths. */}
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <BadgePercentIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-800">
                      Marketplace / Platform Fee
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Platform commission or fee
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative w-[96px] shrink-0">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                      {platformFeeMode === "PERCENT" ? "%" : symbol}
                    </span>
                    <input
                      type="number"
                      min={0}
                      aria-label="Platform fee"
                      value={platformFee === 0 ? "" : platformFee}
                      onChange={(event) => setPlatformFee(Number(event.target.value) || 0)}
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                  <FieldSelect
                    label="Platform fee mode"
                    value={platformFeeMode}
                    onValueChange={(next) => setPlatformFeeMode(next as PlatformFeeMode)}
                    options={[
                      { value: "PERCENT", label: "% of Selling Price" },
                      { value: "FLAT", label: "Flat per unit" },
                    ]}
                    triggerClassName="min-w-0 flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={addCustomCost}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-[13px] font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600"
              >
                <PlusIcon className="h-4 w-4" />
                Add Custom Cost
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 rounded-lg border border-slate-200 px-4 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </section>

          {/* 2. Margin */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[12px] font-bold text-indigo-700">
                2
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">
                  Profit Margin Settings
                </h2>
                <p className="text-[12px] text-slate-500">Choose your target profit margin</p>
              </div>
            </div>

            {/* How margin is defined — the two readings give very different prices */}
            <div className="mt-4 inline-flex rounded-lg border border-slate-200 p-1">
              {(
                [
                  ["MARGIN", "Margin on price"],
                  ["MARKUP", "Markup on cost"],
                ] as [MarginMode, string][]
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMarginMode(mode)}
                  className={`h-8 rounded-md px-4 text-[12px] font-medium transition-colors ${
                    marginMode === mode
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {marginMode === "MARGIN"
                ? "Profit as a share of the selling price — the retail standard. Caps below 100%."
                : "Profit as a share of cost. A 100% markup means the price is twice the cost."}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-emerald-800">
                      Recommended Margin
                    </p>
                    <p className="text-[11px] text-emerald-700/70">
                      Your baseline for this category
                    </p>
                  </div>
                  <div className="relative w-[74px] shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={ceiling}
                      aria-label="Recommended margin"
                      value={recommendedMargin}
                      onChange={(event) =>
                        setRecommendedMargin(
                          Math.min(Number(event.target.value) || 0, ceiling)
                        )
                      }
                      className="h-9 w-full rounded-lg border border-emerald-200 bg-white px-2 text-right text-[16px] font-bold text-emerald-700 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 transition-colors ${
                  useCustomMargin ? "border-indigo-200 bg-indigo-50/60" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-indigo-800">Custom Margin</p>
                    <p className="text-[11px] text-indigo-700/70">
                      Override the recommended value
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={useCustomMargin}
                    onChange={(next) => {
                      setUseCustomMargin(next);
                      // Switching on starts from the recommended figure;
                      // switching off pulls anything above the normal ceiling
                      // back down so the slider can't be left out of range.
                      if (next) setCustomMargin(recommendedMargin);
                      else setRecommendedMargin((current) => Math.min(current, MARGIN_MAX));
                    }}
                    label="Use custom margin"
                  />
                </div>

                {useCustomMargin && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative w-[90px]">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                        %
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={ceiling}
                        aria-label="Custom margin"
                        value={customMargin}
                        onChange={(event) =>
                          setCustomMargin(Math.min(Number(event.target.value) || 0, ceiling))
                        }
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-6 pr-2 text-[13px] outline-none focus:border-indigo-400"
                      />
                    </div>
                    {marginDelta !== 0 && (
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                          marginDelta > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {marginDelta > 0 ? "+" : ""}
                        {marginDelta}% vs recommended
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {targetMargin}%
                </span>
                <span>{ceiling}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={ceiling}
                step={1}
                aria-label="Target margin"
                value={targetMargin}
                // Dragging never flips the Custom Margin switch — it edits
                // whichever margin is currently in play.
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (useCustomMargin) setCustomMargin(next);
                  else setRecommendedMargin(next);
                }}
                className="mt-2 w-full accent-indigo-600"
              />
            </div>

            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
              <InfoIcon className="mr-1 inline h-3 w-3 -translate-y-px" />
              Higher margins increase profit but may affect sales volume. Monitor market
              response.
            </p>
          </section>

          {/* 3. Advanced */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[12px] font-bold text-indigo-700">
                  3
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold text-slate-900">Advanced Options</h2>
                  <p className="text-[12px] text-slate-500">
                    Fine-tune pricing behavior and calculations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced((open) => !open)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-600 hover:text-slate-900"
              >
                {showAdvanced ? "Hide" : "Show"}
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdvancedField icon={TargetIcon} label="Round Off Price" hint="Round to nearest">
                    <FieldSelect
                      label="Round off price"
                      // The Select works in strings; the calculator wants a number.
                      value={String(roundTo)}
                      onValueChange={(next) => setRoundTo(Number(next))}
                      options={[
                        { value: "0", label: "Off" },
                        ...[1, 5, 10, 50, 100].map((step) => ({
                          value: String(step),
                          label: `${symbol}${step}`,
                        })),
                      ]}
                      triggerClassName="h-9 w-[92px] text-[12px]"
                    />
                  </AdvancedField>

                  <AdvancedField icon={LayersIcon} label="Pricing Strategy" hint="Select strategy">
                    <FieldSelect
                      label="Pricing strategy"
                      value={pricingStrategy}
                      onValueChange={setPricingStrategy}
                      options={STRATEGIES}
                      triggerClassName="h-9 w-[130px] text-[12px]"
                    />
                  </AdvancedField>

                  <AdvancedField icon={ShieldCheckIcon} label="Tax / VAT (%)" hint="Added on selling price">
                    <div className="relative w-[86px]">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                        %
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Tax percent"
                        value={taxPercent === 0 ? "" : taxPercent}
                        onChange={(event) => setTaxPercent(Number(event.target.value) || 0)}
                        placeholder="0"
                        className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-[12px] outline-none focus:border-indigo-400"
                      />
                    </div>
                  </AdvancedField>

                  <AdvancedField icon={ShieldCheckIcon} label="Min. Selling Price" hint="Price floor">
                    <div className="relative w-[100px]">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        min={0}
                        aria-label="Minimum selling price"
                        value={minSellingPrice ?? ""}
                        onChange={(event) =>
                          setMinSellingPrice(
                            event.target.value === "" ? null : Number(event.target.value)
                          )
                        }
                        placeholder="None"
                        className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-[12px] outline-none focus:border-indigo-400"
                      />
                    </div>
                  </AdvancedField>

                  <AdvancedField icon={BadgePercentIcon} label="Max. Discount (%)" hint="Allowed discount limit">
                    <div className="relative w-[86px]">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                        %
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Max discount percent"
                        value={maxDiscountPercent === 0 ? "" : maxDiscountPercent}
                        onChange={(event) =>
                          setMaxDiscountPercent(Number(event.target.value) || 0)
                        }
                        placeholder="0"
                        className="h-9 w-full rounded-lg border border-slate-200 pl-6 pr-2 text-[12px] outline-none focus:border-indigo-400"
                      />
                    </div>
                  </AdvancedField>

                  <AdvancedField icon={EyeIcon} label="Price Visibility" hint="Show breakdown to team">
                    <ToggleSwitch
                      checked={priceVisibleToTeam}
                      onChange={setPriceVisibleToTeam}
                      label="Price visibility"
                    />
                  </AdvancedField>
                </div>

                <p className="mt-4 rounded-lg bg-indigo-50/70 px-3 py-2.5 text-[11px] text-indigo-700">
                  <InfoIcon className="mr-1 inline h-3 w-3 -translate-y-px" />
                  These settings apply to every margin calculation and price suggestion below.
                </p>
              </>
            )}
          </section>
        </div>

        {/* ============================== Results ============================= */}
        <div className="space-y-5">
          {/* Headline */}
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-6 text-center">
            <p className="text-[14px] font-medium text-slate-700">Suggested Selling Price</p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[38px] font-bold leading-none text-indigo-600">
                {money(result.sellingPrice)}
              </span>
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
                {result.marginAchieved.toFixed(0)}% Margin
              </span>
            </div>

            <p className="mt-2 text-[12px] text-slate-500">
              at your target margin, after platform fee &amp; taxes
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] text-slate-500">
              <LayersIcon className="h-3 w-3" />
              Includes all costs, fees &amp; tax
            </span>

            {result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-left text-[11px] leading-[17px] text-amber-800"
              >
                {warning}
              </p>
            ))}
          </section>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <Tile label="Total Cost / Unit" value={money(result.totalCost)} />
            <Tile label="Profit / Unit" value={money(result.profitPerUnit)} tone="good" />
            <Tile
              label={`Platform Fee (${platformFee}${platformFeeMode === "PERCENT" ? "%" : ""})`}
              value={money(result.platformFeeAmount)}
            />
            <Tile label={`Tax (${taxPercent}%)`} value={money(result.taxAmount)} />
            <Tile
              label="Margin Achieved"
              value={`${result.marginAchieved.toFixed(0)}%`}
              tone="good"
            />
          </div>

          {/* Cost breakdown */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-slate-900">Cost Breakdown</h2>

            {result.breakdown.length === 0 ? (
              <p className="mt-3 text-[12px] text-slate-400">
                Add your costs above to see how they split.
              </p>
            ) : (
              <>
                <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  {result.breakdown.map((item, index) => (
                    <span
                      key={item.id}
                      title={`${item.label} — ${item.percent.toFixed(1)}%`}
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
                      }}
                    />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                  {result.breakdown.map((item, index) => (
                    <div key={item.id} className="min-w-[120px]">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
                          }}
                        />
                        {item.label}
                      </span>
                      <p className="mt-0.5 text-[13px] text-slate-800">
                        {money(item.amount)}{" "}
                        <span className="text-slate-400">({item.percent.toFixed(1)}%)</span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Tier table */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-slate-900">Margin Tiers Compared</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[440px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 font-medium">Tier</th>
                    <th className="py-2 font-medium">Margin</th>
                    <th className="py-2 font-medium">Selling Price</th>
                    <th className="py-2 text-right font-medium">Profit / Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr
                      key={tier.key}
                      className={`border-b border-slate-50 last:border-0 ${
                        tier.isCurrent ? "bg-indigo-50/70" : ""
                      }`}
                    >
                      <td
                        className={`py-2.5 text-[13px] ${
                          tier.isCurrent
                            ? "font-semibold text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {tier.label} ({tier.margin}%)
                      </td>
                      <td className="py-2.5 text-[13px] text-slate-600">{tier.margin}%</td>
                      <td className="py-2.5 text-[13px] text-slate-800">
                        {tier.price === null ? (
                          <span
                            title="Not achievable — the fee and tax leave no room for this margin"
                            className="text-slate-300"
                          >
                            —
                          </span>
                        ) : (
                          money(tier.price)
                        )}
                      </td>
                      <td className="py-2.5 text-right text-[13px] text-emerald-600">
                        {tier.profit === null ? "—" : money(tier.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              All prices include the platform fee ({platformFee}
              {platformFeeMode === "PERCENT" ? "%" : ` ${symbol}`}) and tax ({taxPercent}%).
            </p>
          </section>

          {/* Insights + quick actions */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-[15px] font-semibold text-slate-900">Pricing Insights</h2>

              <div className="mt-4 space-y-4">
                <Insight
                  icon={TrendingUpIcon}
                  tone={marginDelta >= 0 ? "good" : "warn"}
                  title={
                    marginDelta === 0
                      ? "You are pricing at the recommended margin."
                      : `Your margin is ${Math.abs(marginDelta)}% ${marginDelta > 0 ? "above" : "below"} the recommended level.`
                  }
                  body={`You earn ${money(result.profitPerUnit)} profit per unit at this price.`}
                />
                <Insight
                  icon={LayersIcon}
                  tone="muted"
                  title="Cost structure"
                  body={
                    result.breakdown.length > 0
                      ? `${result.breakdown[0].label} is your largest cost at ${result.breakdown[0].percent.toFixed(0)}% of unit cost.`
                      : "Add costs to see which one dominates."
                  }
                />
                <Insight
                  icon={SparklesIcon}
                  tone="muted"
                  title="Profit potential"
                  body={`At 30 units a month that is ${money(potentialMonthly)} of profit. Change the volume assumption to suit your run rate.`}
                />
                {maxDiscountPercent > 0 && (
                  <Insight
                    icon={BadgePercentIcon}
                    tone={
                      result.sellingPrice * (1 - maxDiscountPercent / 100) >= result.totalCost
                        ? "good"
                        : "warn"
                    }
                    title={`At your ${maxDiscountPercent}% max discount the price is ${money(result.sellingPrice * (1 - maxDiscountPercent / 100))}.`}
                    body={
                      result.sellingPrice * (1 - maxDiscountPercent / 100) >= result.totalCost
                        ? "That still covers your unit cost."
                        : "That falls below your unit cost — you would sell at a loss."
                    }
                  />
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-[15px] font-semibold text-slate-900">Quick Actions</h2>

              <div className="mt-4 space-y-2.5">
                <QuickAction
                  icon={SaveIcon}
                  label={editing ? `Update "${editing.name}"` : "Save this pricing"}
                  onClick={handleSaveTemplate}
                />
                <QuickAction icon={RotateCcwIcon} label="Reset Calculator" onClick={handleReset} />
                <QuickAction
                  icon={DownloadIcon}
                  label={exporting ? "Building report..." : "Download Report (PDF)"}
                  onClick={handleExport}
                />
                <QuickAction
                  icon={Share2Icon}
                  label="Copy summary to clipboard"
                  onClick={async () => {
                    const text = [
                      `${productName || "Product"} — pricing`,
                      `Selling price: ${money(result.sellingPrice)}`,
                      `Total cost: ${money(result.totalCost)}`,
                      `Profit/unit: ${money(result.profitPerUnit)}`,
                      `Margin achieved: ${result.marginAchieved.toFixed(1)}%`,
                    ].join("\n");
                    try {
                      await navigator.clipboard.writeText(text);
                      Toast.fire({ icon: "success", title: "Summary copied" });
                    } catch {
                      Toast.fire({ icon: "error", title: "Clipboard unavailable" });
                    }
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ========================== Saved pricings ========================== */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Saved Pricings</h2>
            <p className="text-[12px] text-slate-500">
              Every pricing you save. Edit one to load it back in, or delete it.
            </p>
          </div>
          <span className="text-[12px] text-slate-400">
            {templates.length} saved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Total Cost</th>
                <th className="px-3 py-3 font-medium">Selling Price</th>
                <th className="px-3 py-3 font-medium">Margin</th>
                <th className="px-3 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-slate-500">
                    Nothing saved yet — price a product above and hit Save Pricing.
                  </td>
                </tr>
              )}

              {templates.map((template) => {
                // Recomputed from the stored inputs rather than saved
                // alongside them, so a change to the maths is reflected here.
                const saved = calculatePricing({
                  costs: template.costs,
                  platformFee: template.platformFee,
                  platformFeeMode: template.platformFeeMode,
                  marginMode: template.marginMode,
                  targetMargin: template.targetMargin,
                  taxPercent: template.taxPercent,
                  roundTo: template.roundTo,
                  minSellingPrice: template.minSellingPrice,
                });
                const savedSymbol =
                  CURRENCIES.find((entry) => entry.code === template.currency)?.symbol ??
                  template.currency;
                const amount = (value: number) =>
                  `${savedSymbol}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                const isEditing = editing?.id === template.id;

                return (
                  <tr
                    key={template.id}
                    className={`border-b border-slate-50 last:border-0 ${
                      isEditing ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[13px] font-semibold ${
                          isEditing ? "text-indigo-700" : "text-slate-900"
                        }`}
                      >
                        {template.name}
                      </span>
                      {isEditing && (
                        <span className="ml-2 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                          editing
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-slate-600">
                      {template.productName || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-slate-600">
                      {amount(saved.totalCost)}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-medium text-slate-900">
                      {saved.infeasible ? "—" : amount(saved.sellingPrice)}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-emerald-600">
                      {saved.infeasible ? "—" : `${saved.marginAchieved.toFixed(0)}%`}
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-slate-400">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Load into the calculator and edit"
                          onClick={() => applyTemplate(template, "edit")}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Rename"
                          onClick={() => handleRenameTemplate(template)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <LayersIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDeleteTemplate(template)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdvancedField({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: typeof TargetIcon;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-tight text-slate-800">{label}</p>
        <p className="text-[11px] leading-tight text-slate-400">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Tile({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "good";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-center">
      <p className="text-[11px] leading-tight text-slate-500">{label}</p>
      <p
        className={`mt-1.5 text-[17px] font-bold ${
          tone === "good" ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Insight({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: typeof TrendingUpIcon;
  title: string;
  body: string;
  tone: "good" | "warn" | "muted";
}) {
  const styles =
    tone === "good"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-50 text-amber-600"
        : "bg-slate-100 text-slate-500";

  return (
    <div className="flex items-start gap-3">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-[11px] leading-[17px] text-slate-500">{body}</p>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof DownloadIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      {label}
    </button>
  );
}
