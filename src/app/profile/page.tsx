import { Metadata } from "next";
import { ProfileView } from "@/features/profile/profile-view";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | PlumoX",
};

export default function ProfilePage() {
  return <ProfileView />;
}
