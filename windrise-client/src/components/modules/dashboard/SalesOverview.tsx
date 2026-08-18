"use client";

import { useState } from "react";

import { DateRangeMenu } from "@/components/modules/inventory/DateRangeMenu";
import { thisMonthRange, type DateRangeSelection } from "@/components/modules/inventory/inventory.utils";

import { BestCustomersSection } from "./BestCustomersSection";
import { CategoryBreakdownSection } from "./CategoryBreakdownSection";
import { CouponDiscountSection } from "./CouponDiscountSection";
import { CustomerOverviewSection } from "./CustomerOverviewSection";
import { DailySnapshotSection } from "./DailySnapshotSection";
import { ExportMenu } from "./ExportMenu";
import { InventorySection } from "./InventorySection";
import { LocationSection } from "./LocationSection";
import { MarketingSection } from "./MarketingSection";
import { OrderStatusSection } from "./OrderStatusSection";
import { ProductPerformanceSection } from "./ProductPerformanceSection";
import { QuickActionsBar } from "./QuickActionsBar";
import { RecentOrdersSection } from "./RecentOrdersSection";
import { ReturnsSection } from "./ReturnsSection";
import { RevenueChartSection } from "./RevenueChartSection";
import { SalesFunnelSection } from "./SalesFunnelSection";
import { SalesTargetSection } from "./SalesTargetSection";
import { SummaryCardsSection } from "./SummaryCardsSection";
import { TopProductsSection } from "./TopProductsSection";
import { TrafficSection } from "./TrafficSection";

export function SalesOverview() {
  const [range, setRange] = useState<DateRangeSelection>(() => thisMonthRange());

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 pb-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Sales Overview</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Sales Overview</h1>
          </div>
          <DateRangeMenu value={range.label} onChange={setRange} />
        </header>

        <QuickActionsBar />

        <SummaryCardsSection startDate={range.start} endDate={range.end} />
        <RevenueChartSection startDate={range.start} endDate={range.end} />
        <OrderStatusSection startDate={range.start} endDate={range.end} />
        <RecentOrdersSection />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
          <div className="lg:col-span-7">
            <CategoryBreakdownSection startDate={range.start} endDate={range.end} />
          </div>
          <div className="lg:col-span-3">
            <TopProductsSection startDate={range.start} endDate={range.end} />
          </div>
        </div>
        <LocationSection startDate={range.start} endDate={range.end} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
          <div className="lg:col-span-6">
            <CustomerOverviewSection startDate={range.start} endDate={range.end} />
          </div>
          <div className="lg:col-span-4">
            <SalesFunnelSection startDate={range.start} endDate={range.end} />
          </div>
        </div>
        <ReturnsSection startDate={range.start} endDate={range.end} />
        <InventorySection />
        <CouponDiscountSection startDate={range.start} endDate={range.end} />
        <TrafficSection startDate={range.start} endDate={range.end} />
        <ProductPerformanceSection startDate={range.start} endDate={range.end} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesTargetSection />
          <DailySnapshotSection />
        </div>
        <BestCustomersSection />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
          <div className="lg:col-span-6">
            <ExportMenu startDate={range.start} endDate={range.end} />
          </div>
          <div className="lg:col-span-4">
            <MarketingSection startDate={range.start} endDate={range.end} />
          </div>
        </div>
      </div>
    </main>
  );
}
