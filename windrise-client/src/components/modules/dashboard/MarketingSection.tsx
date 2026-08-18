"use client";

import { useEffect, useState } from "react";

import { getGoogleAdsPerformance, getMetaAdsPerformance } from "@/services/marketing/marketing";
import type { GoogleAdsPerformance, MetaAdsPerformance, NotConnected } from "@/types/stats";
import { formatNumber, formatTk } from "./dashboard.utils";
import { ConnectPrompt, SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

type MetaState = MetaAdsPerformance | NotConnected | { connected: true; error: string } | null;
type GoogleState = GoogleAdsPerformance | NotConnected | { connected: true; error: string } | null;

export function MarketingSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [meta, setMeta] = useState<MetaState>(null);
  const [google, setGoogle] = useState<GoogleState>(null);

  useEffect(() => {
    let cancelled = false;
    getMetaAdsPerformance({ startDate, endDate })
      .then((res) => !cancelled && setMeta(res))
      .catch(() => {});
    getGoogleAdsPerformance({ startDate, endDate })
      .then((res) => !cancelled && setGoogle(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const metaSpend = meta && "spend" in meta ? meta.spend : 0;
  const googleSpend = google && "spend" in google ? google.spend : 0;
  const metaRevenue = meta && "revenue" in meta ? meta.revenue : 0;
  const googleRevenue = google && "conversionValue" in google ? google.conversionValue : 0;
  const totalSpend = metaSpend + googleSpend;
  const totalRevenue = metaRevenue + googleRevenue;

  return (
    <div className="space-y-4">
      <SectionCard title="Marketing Performance" subtitle="Combined ad spend and return across platforms">
        {!meta || !google ? (
          <div className="h-[100px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <StatCardGrid>
            <StatCard label="Total Ad Spend" value={formatTk(totalSpend)} />
            <StatCard label="Total Ad Revenue" value={formatTk(totalRevenue)} />
            <StatCard
              label="Blended ROAS"
              value={totalSpend === 0 ? "—" : `${(totalRevenue / totalSpend).toFixed(2)}x`}
            />
          </StatCardGrid>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Meta Ads Performance" subtitle="Facebook & Instagram">
          {!meta ? (
            <div className="h-[180px] animate-pulse rounded-xl bg-canvas" />
          ) : !meta.connected ? (
            <ConnectPrompt label="Meta Ads" envHint="META_AD_ACCOUNT_ID and META_ACCESS_TOKEN" />
          ) : "error" in meta ? (
            <ConnectPrompt label="Meta Ads" envHint="valid Meta Ads credentials — the current ones failed" />
          ) : (
            <StatCardGrid>
              <StatCard label="Ad Spend" value={formatTk(meta.spend)} />
              <StatCard label="Purchases" value={formatNumber(meta.purchases)} />
              <StatCard label="Revenue" value={formatTk(meta.revenue)} />
              <StatCard label="Add to Cart" value={formatNumber(meta.addToCart)} />
              <StatCard label="Initiate Checkout" value={formatNumber(meta.initiateCheckout)} />
              <StatCard label="Cost / Purchase" value={formatTk(meta.costPerPurchase)} />
              <StatCard label="ROAS" value={`${meta.roas.toFixed(2)}x`} />
            </StatCardGrid>
          )}
        </SectionCard>

        <SectionCard title="Google Ads Performance">
          {!google ? (
            <div className="h-[180px] animate-pulse rounded-xl bg-canvas" />
          ) : !google.connected ? (
            <ConnectPrompt
              label="Google Ads"
              envHint="GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID and OAuth credentials"
            />
          ) : "error" in google ? (
            <ConnectPrompt label="Google Ads" envHint="valid Google Ads credentials — the current ones failed" />
          ) : (
            <StatCardGrid>
              <StatCard label="Ad Spend" value={formatTk(google.spend)} />
              <StatCard label="Clicks" value={formatNumber(google.clicks)} />
              <StatCard label="Impressions" value={formatNumber(google.impressions)} />
              <StatCard label="Conversions" value={formatNumber(google.conversions)} />
              <StatCard label="Cost / Conversion" value={formatTk(google.costPerConversion)} />
              <StatCard label="ROAS" value={`${google.roas.toFixed(2)}x`} />
            </StatCardGrid>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
