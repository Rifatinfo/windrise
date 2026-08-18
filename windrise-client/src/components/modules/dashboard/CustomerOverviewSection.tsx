"use client";

import { useEffect, useState } from "react";
import { UserCheckIcon, UserPlusIcon, UsersIcon, UserRoundIcon } from "lucide-react";

import { getCustomersOverview, getNewVsReturning } from "@/services/stats/stats";
import type { CustomersOverview, NewVsReturning } from "@/types/stats";
import { CATEGORICAL, formatNumber, formatPercent } from "./dashboard.utils";
import { SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

export function CustomerOverviewSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [overview, setOverview] = useState<CustomersOverview | null>(null);
  const [split, setSplit] = useState<NewVsReturning | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCustomersOverview({ startDate, endDate })
      .then((res) => !cancelled && setOverview(res))
      .catch(() => {});
    getNewVsReturning({ startDate, endDate })
      .then((res) => !cancelled && setSplit(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <SectionCard title="Customer Overview" subtitle="New vs. returning customers in this range">
      {!overview ? (
        <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
      ) : (
        <div className="space-y-4">
          <StatCardGrid>
            <StatCard label="Total Customers" value={formatNumber(overview.totalCustomers)} icon={UsersIcon} />
            <StatCard
              label="New Customers"
              value={formatNumber(overview.newCustomers)}
              change={overview.newCustomerGrowth}
              icon={UserPlusIcon}
              caption="vs previous period"
            />
            <StatCard
              label="Returning Customers"
              value={formatNumber(overview.returningCustomers)}
              change={overview.returningCustomerGrowth}
              icon={UserCheckIcon}
              caption="vs previous period"
            />
            <StatCard label="Active Customers" value={formatNumber(overview.activeCustomers)} icon={UserRoundIcon} />
          </StatCardGrid>

          {split && split.newCustomers + split.returningCustomers > 0 && (
            <div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-canvas">
                <div style={{ width: `${split.newPercentage}%`, backgroundColor: CATEGORICAL[0] }} />
                <div style={{ width: `${split.returningPercentage}%`, backgroundColor: CATEGORICAL[1] }} />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORICAL[0] }} />
                  New · {formatPercent(split.newPercentage)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORICAL[1] }} />
                  Returning · {formatPercent(split.returningPercentage)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
