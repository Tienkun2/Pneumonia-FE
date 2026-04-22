"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyInfo } from "@/store/slices/auth-slice";
import { updateUserThunk } from "@/store/slices/user-slice";
import { UserService } from "@/services/user-service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, User, Shield, Camera, Mail, Phone, Calendar, CheckCircle2, AlertCircle, Laptop } from "lucide-react";
import { useDevices } from "@/hooks/use-devices";
import { DeviceItem } from "@/features/devices/components/device-item";
import { toast } from "sonner";

export function ProfileView() {
  const dispatch = useAppDispatch();
  const { user, isInfoLoading } = useAppSelector((state) => state.auth);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

  const { devices, isLoading: isDevicesLoading, revokeDevice, isRevoking: isRevokingDevice } = useDevices();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhoneNumber(user.phoneNumber || "");
      setDob(user.dob?.split("T")[0] || "");
    }
  }, [user]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUpdating(true);
      await dispatch(
        updateUserThunk({
          id: user.id,
          payload: {
            displayName,
            phoneNumber,
            dob,
          },
        })
      ).unwrap();

      dispatch(fetchMyInfo());
      toast.success("Cập nhật thông tin thành công");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lỗi khi cập nhật hồ sơ");
    } finally {
      setIsUpdating(false);
    }
  }, [user, displayName, phoneNumber, dob, dispatch]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsChangingPass(true);
      await UserService.changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Thay đổi mật khẩu thành công");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lỗi khi đổi mật khẩu");
    } finally {
      setIsChangingPass(false);
    }
  }, [oldPassword, newPassword, confirmPassword]);

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
      setOptimisticAvatar(null); // Rollback on error
    } finally {
      setIsUploadingAvatar(false);
      // We keep the optimistic URL until user data is refreshed or it's no longer needed
      // but fetchMyInfo will update user.avatar anyway.
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
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Profile Section - Adaptive Premium Style */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-slate-900 dark:to-slate-950 p-8 text-foreground shadow-sm transition-all">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <div className="group relative">
            <div className="relative overflow-hidden rounded-full border-4 border-card shadow-xl transition-transform duration-500 group-hover:scale-105 h-32 w-32 bg-card">
              <Avatar className="h-full w-full">
                <AvatarImage src={optimisticAvatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                <AvatarFallback className="bg-primary/10 dark:bg-white/20 text-3xl font-bold uppercase text-primary dark:text-white">
                  {user.username.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Loading Overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Uploading</span>
                  </div>
                </div>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 rounded-full bg-background p-2 text-primary shadow-lg ring-2 ring-primary cursor-pointer hover:bg-muted transition-all active:scale-90 ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Camera className="h-5 w-5" />
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
              {user.displayName || user.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 md:justify-start">
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-md">
                <User className="h-3.5 w-3.5" />
                @{user.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections - Tabs */}
      <Tabs defaultValue="general" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted p-1 mb-6 rounded-xl border border-border">
          <TabsTrigger
            value="general"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all gap-2 font-bold"
          >
            <User className="h-4 w-4" /> Thông tin chung
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all gap-2 font-bold"
          >
            <Shield className="h-4 w-4" /> Bảo mật & Tài khoản
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all gap-2 font-bold"
          >
            <Laptop className="h-4 w-4" /> Thiết bị
          </TabsTrigger>
        </TabsList>

        <div className="space-y-8">
          <TabsContent value="general">
            <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b border-border pb-6">
                <CardTitle className="text-xl font-bold text-foreground">Cập nhật hồ sơ</CardTitle>
                <CardDescription>Thay đổi thông tin liên lạc và hiển thị của bạn</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" /> Tên hiển thị
                      </Label>
                      <Input
                        id="displayName"
                        placeholder="Nguyễn Văn A"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-11 rounded-lg border-border focus:ring-primary focus:border-primary transition-all bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary/70" /> Email
                      </Label>
                      <Input
                        id="email"
                        disabled
                        value={user.email || "Chưa cập nhật"}
                        className="h-11 rounded-lg bg-muted/50 border-border text-muted-foreground italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary/70" /> Số điện thoại
                      </Label>
                      <PhoneInput
                        id="phone"
                        value={phoneNumber}
                        onChange={(val) => setPhoneNumber(val || "")}
                        defaultCountry="VN"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" /> Ngày sinh
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="h-11 rounded-lg border-border focus:ring-primary bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b border-border pb-6">
                <CardTitle className="text-xl font-bold text-foreground">Đổi mật khẩu</CardTitle>
                <CardDescription>Bảo mật tài khoản của bạn bằng mật khẩu mạnh</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 text-primary text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>Mật khẩu mới phải dài ít nhất 6 ký tự và bao gồm các chữ cái, con số hoặc biểu tượng để đảm bảo an toàn.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPass" className="font-semibold text-foreground">Mật khẩu hiện tại</Label>
                      <Input
                        id="oldPass"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="h-11 rounded-lg bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPass" className="font-semibold text-foreground">Mật khẩu mới</Label>
                      <Input
                        id="newPass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 rounded-lg bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPass" className="font-semibold text-foreground">Xác nhận mật khẩu</Label>
                      <Input
                        id="confirmPass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 rounded-lg bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isChangingPass}
                      variant="destructive"
                      className="h-11 px-8 rounded-xl shadow-lg shadow-destructive/20 transition-all"
                    >
                      {isChangingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isChangingPass ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b border-border pb-6">
                <CardTitle className="text-xl font-bold text-foreground">Quản lý thiết bị</CardTitle>
                <CardDescription>Các thiết bị và trình duyệt hiện đang đăng nhập vào tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-4">
                  {isDevicesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                      <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Đang tải thiết bị...</p>
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm font-bold text-muted-foreground italic">Không có thiết bị nào khác được ghi nhận.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {devices.map((device) => (
                        <DeviceItem 
                          key={device.id} 
                          device={device} 
                          onDelete={revokeDevice}
                          isDeleting={isRevokingDevice}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
