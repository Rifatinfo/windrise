"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon } from "lucide-react";

import { exportReport, type ExportFormat, type ExportType } from "@/services/stats/stats";
import { SectionCard } from "./SectionCard";

const TYPES: { id: ExportType; label: string }[] = [
  { id: "sales", label: "Sales Report" },
  { id: "orders", label: "Order Report" },
  { id: "customers", label: "Customer Report" },
  { id: "products", label: "Product Report" },
  { id: "payments", label: "Payment Report" },
  { id: "refunds", label: "Refund Report" },
];

const FORMATS: ExportFormat[] = ["csv", "xlsx", "pdf"];

export function ExportMenu({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (type: ExportType, format: ExportFormat) => {
    const key = `${type}-${format}`;
    setBusyKey(key);
    setError(null);
    try {
      await exportReport(type, format, { startDate, endDate });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <SectionCard id="reports" title="Export Reports" subtitle="Download reports for the selected date range">
      <div className="space-y-2">
        {TYPES.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
            <span className="text-sm font-medium text-ink">{t.label}</span>
            <div className="flex gap-1.5">
              {FORMATS.map((format) => {
                const key = `${t.id}-${format}`;
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => download(t.id, format)}
                    disabled={busyKey === key}
                    className="flex items-center gap-1 rounded-lg bg-canvas px-2.5 py-1.5 text-xs font-semibold uppercase text-ink-soft transition-colors hover:bg-line disabled:opacity-60"
                  >
                    <DownloadIcon className="h-3 w-3" aria-hidden="true" />
                    {format}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-bad">{error}</p>}
      </div>
    </SectionCard>
  );
}
