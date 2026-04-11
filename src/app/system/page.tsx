import { redirect } from "next/navigation";

export default function SystemPage() {
  redirect("/system/user-management/user-list");
}
