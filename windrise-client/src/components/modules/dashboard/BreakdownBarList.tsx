import { CATEGORICAL, formatPercent, formatTk } from "./dashboard.utils";

export interface BreakdownRow {
  name: string;
  value: number;
  percentage: number;
  secondaryLabel?: string;
}

interface BreakdownBarListProps {
  rows: BreakdownRow[];
  valueFormatter?: (value: number) => string;
}

export function BreakdownBarList({ rows, valueFormatter = formatTk }: BreakdownBarListProps) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-muted">No data for this range.</p>;
  }

  return (
    <ul className="space-y-3">
      {rows.map((row, i) => {
        const color = CATEGORICAL[i % CATEGORICAL.length];
        return (
          <li key={row.name} title={`${row.name}: ${valueFormatter(row.value)} (${formatPercent(row.percentage)})`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="truncate">{row.name}</span>
              </span>
              <span className="shrink-0 text-ink-soft">
                {valueFormatter(row.value)}
                {row.secondaryLabel ? ` · ${row.secondaryLabel}` : ""} · {formatPercent(row.percentage)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(row.percentage, 100)}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
