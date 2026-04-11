import { redirect } from "next/navigation";

export default function UserManagementPage() {
  redirect("/system/user-management/user-list");
}
