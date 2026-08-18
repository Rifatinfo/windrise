"use client";

import { useMemo, useState } from "react";
import { MapPinIcon, XIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LocationRow } from "@/types/stats";
import { BD_DIVISION_SHAPES, BD_MAP_HEIGHT, BD_MAP_WIDTH } from "./bangladesh-map-data";
import { EmptyState } from "./SectionCard";
import { CATEGORICAL, formatNumber, formatPercent, formatTk, sequentialScale } from "./dashboard.utils";

const NO_DATA_FILL = "#e7e5de";
const REVENUE_COLOR = CATEGORICAL[0];
const ORDERS_COLOR = CATEGORICAL[1];

interface SalesLocationMapProps {
  rows: LocationRow[] | null;
}

export function SalesLocationMap({ rows }: SalesLocationMapProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  const byName = useMemo(() => {
    const map = new Map<string, LocationRow>();
    for (const row of rows ?? []) map.set(row.location, row);
    return map;
  }, [rows]);

  const maxRevenue = useMemo(
    () => (rows && rows.length > 0 ? Math.max(...rows.map((r) => r.revenue)) : 0),
    [rows],
  );

  const totalOrders = useMemo(() => (rows ?? []).reduce((sum, r) => sum + r.orders, 0), [rows]);

  const rankedNames = useMemo(
    () => [...byName.entries()].sort((a, b) => b[1].revenue - a[1].revenue).map(([name]) => name),
    [byName],
  );

  const fillFor = (name: string) => {
    const row = byName.get(name);
    if (!row || maxRevenue === 0) return NO_DATA_FILL;
    const ratio = Math.sqrt(row.revenue / maxRevenue);
    return sequentialScale(ratio);
  };

  const activeName = selected ?? hovered;
  const activeRow = activeName ? byName.get(activeName) : undefined;
  const activeRank = activeName ? rankedNames.indexOf(activeName) + 1 : 0;

  const compareData = useMemo(() => {
    const entries = [...byName.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
    const maxOrders = entries.reduce((max, [, row]) => Math.max(max, row.orders), 0);
    return entries.map(([name, row]) => ({
      name,
      revenue: row.revenue,
      orders: row.orders,
      percentage: row.percentage,
      revenuePct: maxRevenue === 0 ? 0 : Math.round((row.revenue / maxRevenue) * 1000) / 10,
      ordersPct: maxOrders === 0 ? 0 : Math.round((row.orders / maxOrders) * 1000) / 10,
    }));
  }, [byName, maxRevenue]);

  if (rows === null) {
    return <div className="h-[420px] animate-pulse rounded-xl bg-canvas" />;
  }

  if (rows.length === 0) {
    return <EmptyState message="No orders with a delivery division in this range yet." />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
      {/* Map */}
      <div className="relative">
        <div
          className="relative mx-auto w-full max-w-[360px]"
          onMouseLeave={() => {
            setHovered(null);
            setTooltip(null);
          }}
        >
          <svg
            viewBox={`0 0 ${BD_MAP_WIDTH} ${BD_MAP_HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label="Map of Bangladesh divisions, shaded by revenue"
          >
            {BD_DIVISION_SHAPES.map((division) => {
              const isActive = division.name === activeName;
              const row = byName.get(division.name);
              return (
                <path
                  key={division.name}
                  d={division.d}
                  fill={fillFor(division.name)}
                  stroke={isActive ? "#0b0b0b" : "#fcfcfb"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className="cursor-pointer outline-none transition-[filter] duration-150"
                  style={{ filter: isActive ? "brightness(0.94)" : undefined }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    row
                      ? `${division.name}: ${formatTk(row.revenue)} revenue, ${row.orders} orders`
                      : `${division.name}: no orders yet`
                  }
                  aria-pressed={selected === division.name}
                  onMouseEnter={(e) => {
                    setHovered(division.name);
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onFocus={() => setHovered(division.name)}
                  onClick={() => setSelected((prev) => (prev === division.name ? null : division.name))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected((prev) => (prev === division.name ? null : division.name));
                    }
                  }}
                />
              );
            })}
          </svg>

          {hovered && tooltip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop"
              style={{ left: tooltip.x, top: tooltip.y - 10 }}
            >
              <p className="font-semibold text-ink">{hovered}</p>
              {byName.get(hovered) ? (
                <p className="text-ink-soft">
                  {formatTk(byName.get(hovered)!.revenue)} · {byName.get(hovered)!.orders} orders
                </p>
              ) : (
                <p className="text-ink-muted">No orders yet</p>
              )}
            </div>
          )}
        </div>

        {/* Sequential legend */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-ink-muted">
          <span>Low</span>
          <span
            className="h-2.5 w-28 rounded-full"
            style={{ background: "linear-gradient(to right, #cde2fb, #184f95)" }}
            aria-hidden="true"
          />
          <span>High</span>
          <span className="ml-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NO_DATA_FILL }} aria-hidden="true" />
            No data
          </span>
        </div>
      </div>

      {/* Detail panel */}
      <div className="rounded-xl border border-line bg-canvas/60 p-4">
        {activeRow && activeName ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{activeName}</p>
                  <p className="text-[11px] text-ink-muted">
                    #{activeRank} of {byName.size} divisions by revenue
                  </p>
                </div>
              </div>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Clear selection"
                  className="rounded-md p-1 text-ink-muted transition-colors hover:bg-line hover:text-ink"
                >
                  <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-surface px-2 py-2.5 shadow-card">
                <p className="text-[10px] text-ink-muted">Revenue</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatTk(activeRow.revenue)}</p>
              </div>
              <div className="rounded-lg bg-surface px-2 py-2.5 shadow-card">
                <p className="text-[10px] text-ink-muted">Orders</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatNumber(activeRow.orders)}</p>
              </div>
              <div className="rounded-lg bg-surface px-2 py-2.5 shadow-card">
                <p className="text-[10px] text-ink-muted">Share</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatPercent(activeRow.percentage)}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(activeRow.percentage, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-ink-muted">
                {formatPercent((activeRow.orders / Math.max(totalOrders, 1)) * 100)} of orders in this range
              </p>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-1 text-xs font-medium text-ink-soft">{activeName} vs. every division</p>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={compareData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ORDERS_COLOR} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={ORDERS_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    height={42}
                    tickLine={false}
                    axisLine={{ stroke: "#c3c2b7" }}
                    tick={(props) => <DivisionTick {...props} activeName={activeName} />}
                  />
                  <YAxis hide domain={[0, 100]} />
                  {activeName && (
                    <ReferenceLine x={activeName} stroke="#0b0b0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                  )}
                  <Tooltip content={<CompareTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={24}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenuePct"
                    name="Revenue"
                    stroke={REVENUE_COLOR}
                    strokeWidth={2}
                    fill="url(#revenueArea)"
                    dot={{ r: 2.5, strokeWidth: 0, fill: REVENUE_COLOR }}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ordersPct"
                    name="Orders"
                    stroke={ORDERS_COLOR}
                    strokeWidth={2}
                    fill="url(#ordersArea)"
                    dot={{ r: 2.5, strokeWidth: 0, fill: ORDERS_COLOR }}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-ink-soft">Click a division to see its numbers</p>
            <ul className="mt-3 space-y-2.5">
              {rankedNames.slice(0, 5).map((name, i) => {
                const row = byName.get(name)!;
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => setSelected(name)}
                      onMouseEnter={() => setHovered(name)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: fillFor(name) }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
                        {i + 1}. {name}
                      </span>
                      <span className="shrink-0 text-xs text-ink-soft">{formatTk(row.revenue)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface CompareTooltipPayload {
  payload: { name: string; revenue: number; orders: number; percentage: number };
}

function CompareTooltip({ active, payload }: { active?: boolean; payload?: CompareTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{d.name}</p>
      <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
        <span className="h-[3px] w-3 rounded-full" style={{ backgroundColor: REVENUE_COLOR }} aria-hidden="true" />
        Revenue: <span className="font-medium text-ink">{formatTk(d.revenue)}</span>
      </p>
      <p className="flex items-center gap-1.5 text-ink-soft">
        <span className="h-[3px] w-3 rounded-full" style={{ backgroundColor: ORDERS_COLOR }} aria-hidden="true" />
        Orders: <span className="font-medium text-ink">{formatNumber(d.orders)}</span>
      </p>
      <p className="mt-1 text-ink-muted">{formatPercent(d.percentage)} of total revenue</p>
    </div>
  );
}

interface DivisionTickProps {
  x?: string | number;
  y?: string | number;
  payload?: { value: string };
  activeName: string | null;
}

function DivisionTick({ x = 0, y = 0, payload, activeName }: DivisionTickProps) {
  if (!payload) return null;
  const isActive = payload.value === activeName;

  return (
    <text
      x={x}
      y={y}
      dy={10}
      textAnchor="end"
      transform={`rotate(-35, ${x}, ${y})`}
      fontSize={9.5}
      fontWeight={isActive ? 700 : 400}
      fill={isActive ? "#0b0b0b" : "#898781"}
    >
      {payload.value}
    </text>
  );
}
