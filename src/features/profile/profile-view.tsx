"use client";

import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyInfo } from "@/store/slices/auth-slice";
import { UserService } from "@/services/user-service";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Shield } from "lucide-react";
import { toast } from "sonner";

import { ProfileHeader } from "./components/profile-header";
import { GeneralTab } from "./components/general-tab";
import { SecurityTab } from "./components/security-tab";

export function ProfileView() {
  const dispatch = useAppDispatch();
  const { user, isInfoLoading } = useAppSelector((state) => state.auth);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setOptimisticAvatar(previewUrl);

    try {
      setIsUploadingAvatar(true);
      await UserService.uploadAvatar(file);
      dispatch(fetchMyInfo());
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lỗi khi tải ảnh lên");
      setOptimisticAvatar(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [dispatch]);

  if (isInfoLoading && !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <ProfileHeader 
        user={user}
        optimisticAvatar={optimisticAvatar}
        isUploadingAvatar={isUploadingAvatar}
        onAvatarUpload={handleAvatarUpload}
      />

      <Tabs defaultValue="general" className="w-full max-w-5xl mx-auto">
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-1.5 mb-5">
          <TabsList className="bg-transparent w-full grid grid-cols-2 gap-1 h-auto">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 h-9 rounded-xl text-[13px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground transition-all duration-150"
            >
              <User className="h-3.5 w-3.5" /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 h-9 rounded-xl text-[13px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground transition-all duration-150"
            >
              <Shield className="h-3.5 w-3.5" /> Bảo mật & Tài khoản
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="space-y-8">
          <TabsContent value="general">
            <GeneralTab user={user} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
