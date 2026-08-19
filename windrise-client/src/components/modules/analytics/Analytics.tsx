"use client";

import { useState } from "react";

import { DateRangeMenu } from "@/components/modules/inventory/DateRangeMenu";
import {
  buildAnalyticsRanges,
  last30DaysRange,
  type DateRangeSelection,
} from "@/components/modules/inventory/inventory.utils";

import { CategoryBreakdownSection } from "@/components/modules/dashboard/CategoryBreakdownSection";
import { CustomerOverviewSection } from "@/components/modules/dashboard/CustomerOverviewSection";
import { InventorySection } from "@/components/modules/dashboard/InventorySection";
import { OrderStatusSection } from "@/components/modules/dashboard/OrderStatusSection";
import { ProductPerformanceSection } from "@/components/modules/dashboard/ProductPerformanceSection";
import { ReturnsSection } from "@/components/modules/dashboard/ReturnsSection";
import { RevenueChartSection } from "@/components/modules/dashboard/RevenueChartSection";
import { SalesFunnelSection } from "@/components/modules/dashboard/SalesFunnelSection";
import { SummaryCardsSection } from "@/components/modules/dashboard/SummaryCardsSection";
import { TopProductsSection } from "@/components/modules/dashboard/TopProductsSection";

import { BusinessHealthSection } from "./BusinessHealthSection";
import { CategoryMixAreaSection } from "./CategoryMixAreaSection";
import { DistributionPieSection } from "./DistributionPieSection";
import { PaymentMethodSection } from "./PaymentMethodSection";
import { RevenueOrdersLineSection } from "./RevenueOrdersLineSection";

/**
 * Analytics reads the same stats API as Sales Overview but is arranged for
 * analysis rather than daily operations: headline KPIs and growth first,
 * then trend, then progressively deeper breakdowns.
 */
export function Analytics() {
  const [range, setRange] = useState<DateRangeSelection>(() => last30DaysRange());

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 pb-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Analytics</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Analytics</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Business performance for {range.label.toLowerCase()}, compared with the
              previous period of the same length.
            </p>
          </div>
          <DateRangeMenu
            value={range.label}
            onChange={setRange}
            buildRanges={buildAnalyticsRanges}
          />
        </header>

        {/* 1 — headline KPIs, each with its own vs-previous delta */}
        <SummaryCardsSection startDate={range.start} endDate={range.end} />

        {/* 2 — growth and after-sales pressure */}
        <BusinessHealthSection startDate={range.start} endDate={range.end} />

        {/* 3 — headline trend (area) */}
        <RevenueChartSection startDate={range.start} endDate={range.end} />

        {/* 4 — the same period as three related series on two axes */}
        <RevenueOrdersLineSection startDate={range.start} endDate={range.end} />

        {/* 5 — how the category mix moves over time (stacked area) */}
        <CategoryMixAreaSection startDate={range.start} endDate={range.end} />

        {/* 6 — order performance. Full width: it lays out one tile per order
            status, which truncates badly in a half-width column. */}
        <OrderStatusSection startDate={range.start} endDate={range.end} />

        {/* 7 — composition: donut beside the ranked category bars */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DistributionPieSection startDate={range.start} endDate={range.end} />
          <SalesFunnelSection startDate={range.start} endDate={range.end} />
        </div>

        {/* 8 — what is selling (bar chart + ranked list) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
          <div className="lg:col-span-7">
            <CategoryBreakdownSection startDate={range.start} endDate={range.end} />
          </div>
          <div className="lg:col-span-3">
            <TopProductsSection startDate={range.start} endDate={range.end} />
          </div>
        </div>

        {/* 9 — payment detail with exact figures behind the donut */}
        <PaymentMethodSection startDate={range.start} endDate={range.end} />

        {/* 10 — who is buying. Full width for the same reason as order status. */}
        <CustomerOverviewSection startDate={range.start} endDate={range.end} />

        {/* 11 — what came back */}
        <ReturnsSection startDate={range.start} endDate={range.end} />

        {/* 12 — deeper product detail and stock health (stock is point-in-time,
            so it deliberately ignores the date range) */}
        <ProductPerformanceSection startDate={range.start} endDate={range.end} />
        <InventorySection />
      </div>
    </main>
  );
}
