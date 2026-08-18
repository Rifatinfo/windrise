"use client";

import { useEffect, useState } from "react";

import { getSalesByLocation } from "@/services/stats/stats";
import type { LocationRow } from "@/types/stats";
import { SalesLocationMap } from "./SalesLocationMap";
import { SectionCard } from "./SectionCard";

export function LocationSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [locations, setLocations] = useState<LocationRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLocations(null);
    getSalesByLocation({ startDate, endDate })
      .then((res) => !cancelled && setLocations(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <SectionCard title="Sales by Location" subtitle="Click a division on the map to see its numbers">
      <SalesLocationMap rows={locations} />
    </SectionCard>
  );
}
