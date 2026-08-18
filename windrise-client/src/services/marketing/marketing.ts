import type {
  GoogleAdsPerformance,
  MetaAdsPerformance,
  NotConnected,
  ConnectedWithError,
  TrafficOverview,
  TrafficSources,
} from "@/types/stats";
import type { DateRangeParams } from "@/services/stats/stats";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

async function get<T>(path: string, params?: DateRangeParams): Promise<T> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();

  const res = await fetch(`${API_URL}/api/v1/marketing${path}${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export const getTrafficOverview = (params: DateRangeParams) =>
  get<TrafficOverview | NotConnected | ConnectedWithError>("/traffic", params);

export const getTrafficSources = (params: DateRangeParams) =>
  get<TrafficSources | NotConnected | ConnectedWithError>("/traffic-sources", params);

export const getMetaAdsPerformance = (params: DateRangeParams) =>
  get<MetaAdsPerformance | NotConnected | ConnectedWithError>("/meta-ads", params);

export const getGoogleAdsPerformance = (params: DateRangeParams) =>
  get<GoogleAdsPerformance | NotConnected | ConnectedWithError>("/google-ads", params);
