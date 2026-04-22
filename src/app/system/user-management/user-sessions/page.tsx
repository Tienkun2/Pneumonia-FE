import { UserSessionsView } from "@/features/user-sessions/user-sessions-view";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Lịch sử hoạt động | PlumoX",
  description: "Quản lý phiên đăng nhập và lịch sử truy cập hệ thống của người dùng.",
};

export default function UserSessionsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    }>
      <UserSessionsView />
    </Suspense>
  );
}
