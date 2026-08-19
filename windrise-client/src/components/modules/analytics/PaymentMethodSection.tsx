"use client";

import { useEffect, useState } from "react";

import { getSalesByPaymentMethod } from "@/services/stats/stats";
import type { PaymentMethodRow } from "@/types/stats";
import { BreakdownBarList } from "@/components/modules/dashboard/BreakdownBarList";
import { SectionCard, EmptyState } from "@/components/modules/dashboard/SectionCard";
import { formatNumber, formatTk } from "@/components/modules/dashboard/dashboard.utils";

export function PaymentMethodSection({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  // Tagging the result with the range it belongs to means a range change
  // shows the skeleton again without resetting state inside the effect.
  const rangeKey = `${startDate}|${endDate}`;
  const [result, setResult] = useState<{
    key: string;
    rows: PaymentMethodRow[] | null;
    failed: boolean;
  }>({ key: "", rows: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    const key = `${startDate}|${endDate}`;
    getSalesByPaymentMethod({ startDate, endDate })
      .then((res) => !cancelled && setResult({ key, rows: res, failed: false }))
      .catch(() => !cancelled && setResult({ key, rows: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const settled = result.key === rangeKey;
  const rows = settled ? result.rows : null;
  const failed = settled && result.failed;

  return (
    <SectionCard
      title="Payment Mix"
      subtitle="Revenue share by how customers paid"
    >
      {failed ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          Couldn&apos;t load the payment mix for this range.
        </p>
      ) : !rows ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-canvas" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState message="No payments recorded in this range." />
      ) : (
        <BreakdownBarList
          rows={rows.map((row) => ({
            name: row.method,
            value: row.revenue,
            percentage: row.percentage,
            secondaryLabel: `${formatNumber(row.transactions)} txn`,
          }))}
          valueFormatter={formatTk}
        />
      )}
    </SectionCard>
  );
}
