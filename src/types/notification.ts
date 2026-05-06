export type NotificationType = "DIAGNOSIS" | "PATIENT" | "SECURITY" | "SYSTEM";

export interface NotificationDto {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
}

export interface NotificationItem extends NotificationDto {
  formattedTime: string;
}
