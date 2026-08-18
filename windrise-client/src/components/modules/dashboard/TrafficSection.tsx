"use client";

import { useEffect, useState } from "react";

import { getTrafficOverview, getTrafficSources } from "@/services/marketing/marketing";
import type { NotConnected, TrafficOverview, TrafficSources } from "@/types/stats";
import { BreakdownBarList } from "./BreakdownBarList";
import { formatNumber, formatPercent } from "./dashboard.utils";
import { ConnectPrompt, SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

type TrafficState = TrafficOverview | NotConnected | { connected: true; error: string } | null;
type SourcesState = TrafficSources | NotConnected | { connected: true; error: string } | null;

export function TrafficSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [overview, setOverview] = useState<TrafficState>(null);
  const [sources, setSources] = useState<SourcesState>(null);

  useEffect(() => {
    let cancelled = false;
    getTrafficOverview({ startDate, endDate })
      .then((res) => !cancelled && setOverview(res))
      .catch(() => {});
    getTrafficSources({ startDate, endDate })
      .then((res) => !cancelled && setSources(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard title="Website Traffic Overview" subtitle="Powered by Google Analytics 4">
        {!overview ? (
          <div className="h-[180px] animate-pulse rounded-xl bg-canvas" />
        ) : !overview.connected ? (
          <ConnectPrompt label="Google Analytics" envHint="GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON" />
        ) : "error" in overview ? (
          <ConnectPrompt label="Google Analytics" envHint="valid GA4 credentials — the current ones failed" />
        ) : (
          <StatCardGrid>
            <StatCard label="Total Visitors" value={formatNumber(overview.totalVisitors)} />
            <StatCard label="Unique Visitors" value={formatNumber(overview.uniqueVisitors)} />
            <StatCard label="Sessions" value={formatNumber(overview.sessions)} />
            <StatCard label="Page Views" value={formatNumber(overview.pageViews)} />
            <StatCard label="New Users" value={formatNumber(overview.newUsers)} />
            <StatCard label="Returning Users" value={formatNumber(overview.returningUsers)} />
            <StatCard label="Avg. Session Duration" value={`${Math.round(overview.avgSessionDurationSeconds)}s`} />
            <StatCard label="Bounce Rate" value={formatPercent(overview.bounceRate)} />
          </StatCardGrid>
        )}
      </SectionCard>

      <SectionCard title="Traffic Sources" subtitle="Where visitors came from">
        {!sources ? (
          <div className="h-[180px] animate-pulse rounded-xl bg-canvas" />
        ) : !sources.connected ? (
          <ConnectPrompt label="Google Analytics" envHint="GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON" />
        ) : "error" in sources ? (
          <ConnectPrompt label="Google Analytics" envHint="valid GA4 credentials — the current ones failed" />
        ) : (
          <BreakdownBarList
            valueFormatter={(v) => `${v} sessions`}
            rows={sources.sources.map((s) => ({ name: s.source, value: s.sessions, percentage: s.percentage }))}
          />
        )}
      </SectionCard>
    </div>
  );
}
