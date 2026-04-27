import { UserSessionsView } from "@/features/user-sessions/user-sessions-view";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Lịch sử hoạt động | PlumoX",
  description: "Quản lý phiên đăng nhập và lịch sử truy cập hệ thống của người dùng.",
};

export default function UserSessionsPage() {
  return (
    <Suspense fallback={null}>
      <UserSessionsView />
    </Suspense>
  );
}
