import type { PublicSettings, StoreSettings, StoreSettingsPatch } from "@/types/settings";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function handleError(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.message ?? `Request failed with status ${res.status}`);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_URL}/api/v1/settings`, { credentials: "include" });
  if (!res.ok) await handleError(res);
  return (await res.json()).data;
}

export async function updateStoreSettings(
  patch: StoreSettingsPatch
): Promise<StoreSettings> {
  const res = await fetch(`${API_URL}/api/v1/settings`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) await handleError(res);
  return (await res.json()).data;
}

/** Storefront-safe subset; no authentication required. */
export async function getPublicSettings(): Promise<PublicSettings> {
  const res = await fetch(`${API_URL}/api/v1/settings/public`);
  if (!res.ok) await handleError(res);
  return (await res.json()).data;
}
