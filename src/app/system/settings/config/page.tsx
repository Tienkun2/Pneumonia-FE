import SettingsView from "@/features/settings/settings-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt chung - PlumoX",
  description: "Cài đặt chung và tuỳ chỉnh hệ thống",
};

export default function SettingsPage() {
  return <SettingsView />;
}
