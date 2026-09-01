"use client";

import type { Stats } from "@/services/support/support";
import { duration } from "./support.helpers";

const CARD =
  "rounded-xl border border-[#e8eaf0] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${className}`} />;
}

function Card({
  label,
  value,
  note,
  dot,
  noteClass = "text-[#8b93a7]",
}: {
  label: string;
  value: string;
  note: string;
  dot?: string;
  noteClass?: string;
}) {
  return (
    <div className={CARD}>
      <p className="text-[12.5px] text-[#8b93a7]">{label}</p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {/* "2m 18s" must never break across two lines on a narrow card. */}
        <span className="whitespace-nowrap text-[26px] font-semibold leading-none text-[#1b2033]">
          {value}
        </span>
        <span className={`flex items-center gap-1 text-[11.5px] ${noteClass}`}>
          {dot ? <Dot className={dot} /> : null}
          {note}
        </span>
      </div>
    </div>
  );
}

/**
 * The five figures across the top.
 *
 * Every one is a real measurement from the API — no placeholders. Where a
 * number cannot be computed yet (no answered conversation, so no average
 * response time) it shows a dash rather than a reassuring zero.
 */
export function StatCards({ stats }: { stats: Stats | null }) {
  const trend =
    stats?.resolvedTrend === null || stats?.resolvedTrend === undefined
      ? null
      : `${stats.resolvedTrend > 0 ? "+" : ""}${stats.resolvedTrend}%`;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Card
        label="Open Chats"
        value={stats ? String(stats.openChats) : "—"}
        note="Live"
        dot="bg-[#22c55e]"
      />
      <Card
        label="In Queue"
        value={stats ? String(stats.inQueue) : "—"}
        note="Waiting"
      />
      <Card
        label="My Chats"
        value={stats ? String(stats.myChats) : "—"}
        note="Active"
        dot="bg-[#22c55e]"
      />
      <Card
        label="Resolved Today"
        value={stats ? String(stats.resolvedToday) : "—"}
        note={trend ?? "No change yet"}
        dot={trend ? "bg-[#22c55e]" : undefined}
        noteClass={
          trend && (stats?.resolvedTrend ?? 0) >= 0 ? "text-[#1a9f5b]" : "text-[#d0342c]"
        }
      />
      <Card
        label="Avg. Response Time"
        value={duration(stats?.avgResponseSeconds ?? null)}
        note={stats?.avgResponseWindow === "today" ? "Today" : "This hour"}
      />
    </div>
  );
}
