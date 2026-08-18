export type NotificationType = "stock" | "order" | "shipment" | "product" | "analytics" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  timestamp: string;
  isRead: boolean;
  link: string;
}
