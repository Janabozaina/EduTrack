import api from "./api";

export type NotificationType =
  | "payment-reminder"
  | "payment-success"
  | "attendance-absence";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className?: string;
  groupName?: string;
}

export async function getNotifications() {
  const { data } = await api.get<{ success: boolean; data: NotificationItem[] }>(
    "/notifications"
  );
  return data;
}
