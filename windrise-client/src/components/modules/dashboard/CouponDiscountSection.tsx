"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCouponsPerformance, getDiscountsPerformance } from "@/services/stats/stats";
import type { CouponsPerformance, DiscountsPerformance } from "@/types/stats";
import { formatNumber, formatPercent, formatTk } from "./dashboard.utils";
import { SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

export function CouponDiscountSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [coupons, setCoupons] = useState<CouponsPerformance | null>(null);
  const [discounts, setDiscounts] = useState<DiscountsPerformance | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCouponsPerformance({ startDate, endDate })
      .then((res) => !cancelled && setCoupons(res))
      .catch(() => {});
    getDiscountsPerformance({ startDate, endDate })
      .then((res) => !cancelled && setDiscounts(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard
        title="Coupon Performance"
        action={
          <Link href="/admin/coupons" className="text-xs font-medium text-brand hover:underline">
            Manage coupons
          </Link>
        }
      >
        {!coupons ? (
          <div className="h-[200px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <div className="space-y-3">
            <StatCardGrid>
              <StatCard label="Total Coupons" value={formatNumber(coupons.totalCoupons)} />
              <StatCard label="Active Coupons" value={formatNumber(coupons.activeCoupons)} />
              <StatCard label="Used Coupons" value={formatNumber(coupons.usedCoupons)} />
              <StatCard label="Total Discount Given" value={formatTk(coupons.totalDiscountGiven)} />
              <StatCard label="Revenue Generated" value={formatTk(coupons.revenueGenerated)} />
            </StatCardGrid>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-lg border border-line px-3 py-2">
                <p className="text-ink-muted">Most Used Coupon</p>
                <p className="font-medium text-ink">
                  {coupons.mostUsedCoupon ? `${coupons.mostUsedCoupon.code} · ${coupons.mostUsedCoupon.usedCount} uses` : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-line px-3 py-2">
                <p className="text-ink-muted">Best Performing Coupon</p>
                <p className="font-medium text-ink">
                  {coupons.bestPerformingCoupon
                    ? `${coupons.bestPerformingCoupon.code} · ${formatTk(coupons.bestPerformingCoupon.revenueGenerated)}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Discount Performance" subtitle="From active product/category discounts">
        {!discounts ? (
          <div className="h-[200px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <StatCardGrid>
            <StatCard label="Total Discount" value={formatTk(discounts.totalDiscount)} />
            <StatCard label="Avg. Discount / Order" value={formatTk(discounts.avgDiscountPerOrder)} />
            <StatCard label="Discounted Orders" value={formatNumber(discounts.discountedOrders)} />
            <StatCard label="Revenue After Discount" value={formatTk(discounts.revenueAfterDiscount)} />
            <StatCard label="Discount %" value={formatPercent(discounts.discountPercentage)} />
            <StatCard label="Active Discounts" value={formatNumber(discounts.activeDiscounts)} />
          </StatCardGrid>
        )}
      </SectionCard>
    </div>
  );
}
