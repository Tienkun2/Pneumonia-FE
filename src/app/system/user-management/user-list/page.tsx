import { Metadata } from "next";
import { UserPage } from "@/features/users/user-page";

export const metadata: Metadata = {
  title: "Danh sách người dùng | PlumoX",
};

export default function UserListPage() {
  return <UserPage />;
}

