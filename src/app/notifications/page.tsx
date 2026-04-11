import { NotificationsView } from "@/features/notifications/notifications-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlumoX - Hệ thống chẩn đoán hình phổi AI",
  description: "Quản lý và xem lại lịch sử các thông báo hệ thống và kết quả chẩn đoán AI.",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
