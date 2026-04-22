import { UserDevicesAdminView } from "@/features/devices/user-devices-view";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Quản lý thiết bị | PlumoX",
  description: "Trang quản trị danh sách thiết bị của người dùng trên hệ thống.",
};

export default function UserDevicesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    }>
      <UserDevicesAdminView />
    </Suspense>
  );
}
