import { apiClient } from "@/services/api-client";
import { ApiResponse, PageResponse } from "@/types/api";

export interface NotificationDto {
  id: string;
  content: string;
  read: boolean;
  createdAt: string; // ISO 8601 UTC
}

export const NotificationService = {
  async getNotifications(page: number = 1, size: number = 20) {
    const res = await apiClient(`/notifications?page=${page}&size=${size}`, {
      method: "GET",
    });
    const data: ApiResponse<PageResponse<NotificationDto>> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to fetch notifications");
    }
    return data.result;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient("/notifications/unread-count", {
      method: "GET",
    });
    const data: ApiResponse<number> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to fetch unread count");
    }
    return data.result;
  },

  async markAllAsRead(): Promise<void> {
    const res = await apiClient("/notifications/mark-all-read", {
      method: "PUT",
    });
    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to mark all as read");
    }
  },

  async markOneAsRead(id: string): Promise<void> {
    const res = await apiClient(`/notifications/${id}/read`, {
      method: "PUT",
    });
    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to mark notification as read");
    }
  },

  async deleteOne(id: string): Promise<void> {
    const res = await apiClient(`/notifications/${id}`, {
      method: "DELETE",
    });
    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to delete notification");
    }
  },

  async deleteAll(): Promise<void> {
    const res = await apiClient("/notifications", {
      method: "DELETE",
    });
    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
      throw new Error(data.message || "Failed to delete all notifications");
    }
  },
};
