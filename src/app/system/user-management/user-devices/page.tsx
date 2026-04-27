import { UserDevicesAdminView } from "@/features/devices/user-devices-view";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Quản lý thiết bị | PlumoX",
  description: "Trang quản trị danh sách thiết bị của người dùng trên hệ thống.",
};

export default function UserDevicesPage() {
  return (
    <Suspense fallback={null}>
      <UserDevicesAdminView />
    </Suspense>
  );
}
