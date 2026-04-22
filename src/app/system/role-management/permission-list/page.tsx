import { PermissionList } from "@/features/permissions/permission-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách quyền | PlumoX",
};

export default function PermissionListPage() {
  return <PermissionList />;
}
