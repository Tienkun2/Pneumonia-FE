import { Metadata } from "next";
import { RoleList } from "@/features/roles/role-list";

export const metadata: Metadata = {
  title: "Danh sách vai trò | PlumoX",
};

export default function RoleListPage() {
  return <RoleList />;
}
