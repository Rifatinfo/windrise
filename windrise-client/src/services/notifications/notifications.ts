import type { NotificationType } from "@/types/notification";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface RawNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  link: string;
}

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export async function getNotifications(): Promise<RawNotification[]> {
  const res = await fetch(`${API_URL}/api/v1/stats/alerts`, { credentials: "include" });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}
