// Shared formatting + a validated categorical palette (see dataviz skill reference palette)
// used across every chart on the Sales Overview page. Order is the CVD-safety mechanism —
// never reassign slots, never cycle past 8 (fold the rest into "Other").

export const CATEGORICAL = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const;

export const SEQUENTIAL_BLUE = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#2a78d6", "#184f95"] as const;

export function formatTk(value: number): string {
  return `৳${Math.round(value).toLocaleString("en-US")}`;
}

export function formatTkCompact(value: number): string {
  if (Math.abs(value) >= 100000) return `৳${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `৳${(value / 1000).toFixed(1)}k`;
  return `৳${Math.round(value).toLocaleString("en-US")}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function changeTone(value: number): "good" | "bad" | "muted" {
  if (value > 0) return "good";
  if (value < 0) return "bad";
  return "muted";
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linearly mixes two hex colors; t=0 -> a, t=1 -> b. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/** Maps a 0..1 ratio onto the sequential blue ramp (light = low, dark = high). */
export function sequentialScale(ratio: number): string {
  const stops = SEQUENTIAL_BLUE;
  const clamped = Math.max(0, Math.min(1, ratio));
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(Math.floor(scaled), stops.length - 2);
  const t = scaled - i;
  return mixHex(stops[i], stops[i + 1], t);
}

/** Folds rows past the categorical cap of 8 into a single "Other" bucket. */
export function capToOther<T extends { name: string; revenue?: number; percentage: number }>(
  rows: T[],
  make: (name: string, percentage: number, revenue: number) => T,
): T[] {
  if (rows.length <= 8) return rows;
  const head = rows.slice(0, 7);
  const rest = rows.slice(7);
  const otherPercentage = rest.reduce((sum, r) => sum + r.percentage, 0);
  const otherRevenue = rest.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  return [...head, make("Other", otherPercentage, otherRevenue)];
}
