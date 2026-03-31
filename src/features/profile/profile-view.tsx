"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyInfo } from "@/store/slices/auth-slice";
import { updateUserThunk } from "@/store/slices/userSlice";
import { UserService } from "@/services/user-service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, User, Shield, Camera, Mail, Phone, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ProfileView() {
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  
   const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

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

    // Optimistic UI preview
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

  if (isAuthLoading && !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Profile Section - Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl transition-all hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        
        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <div className="group relative">
            <div className="relative overflow-hidden rounded-full border-4 border-white/30 shadow-xl transition-transform duration-500 group-hover:scale-105 h-32 w-32 bg-white/10">
              <Avatar className="h-full w-full">
                <AvatarImage src={optimisticAvatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                <AvatarFallback className="bg-white/20 text-3xl font-bold uppercase">
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
              className={`absolute bottom-0 right-0 rounded-full bg-white p-2 text-primary shadow-lg ring-2 ring-blue-500 cursor-pointer hover:bg-slate-100 transition-all active:scale-90 ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
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
            <h1 className="text-4xl font-black tracking-tight drop-shadow-md">
              {user.displayName || user.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 md:justify-start">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md">
                <User className="h-3.5 w-3.5" />
                @{user.username}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 px-3 py-1 text-sm font-medium backdrop-blur-md">
                <Shield className="h-3.5 w-3.5" />
                {user.roles?.[0]?.description || "Thành viên"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections - Tabs */}
      <Tabs defaultValue="general" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100/80 p-1 mb-6 rounded-xl">
          <TabsTrigger 
            value="general" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all gap-2"
          >
            <User className="h-4 w-4" /> Thông tin chung
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all gap-2"
          >
            <Shield className="h-4 w-4" /> Bảo mật & Tài khoản
          </TabsTrigger>
        </TabsList>

        <div className="space-y-8">
            <TabsContent value="general">
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800">Cập nhật hồ sơ</CardTitle>
                  <CardDescription>Thay đổi thông tin liên lạc và hiển thị của bạn</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Tên hiển thị
                        </Label>
                        <Input
                          id="displayName"
                          placeholder="Nguyễn Văn A"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-11 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-blue-500" /> Email
                        </Label>
                        <Input
                          id="email"
                          disabled
                          value={user.email || "Chưa cập nhật"}
                          className="h-11 rounded-lg bg-slate-50 border-slate-100 text-slate-400 italic"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-blue-500" /> Số điện thoại
                        </Label>
                        <PhoneInput
                          id="phone"
                          value={phoneNumber}
                          onChange={(val) => setPhoneNumber(val || "")}
                          defaultCountry="VN"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob" className="text-sm font-semibold flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" /> Ngày sinh
                        </Label>
                        <Input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="h-11 rounded-lg border-slate-200 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-slate-50">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
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
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800">Đổi mật khẩu</CardTitle>
                  <CardDescription>Bảo mật tài khoản của bạn bằng mật khẩu mạnh</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Mật khẩu mới phải dài ít nhất 6 ký tự và bao gồm các chữ cái, con số hoặc biểu tượng để đảm bảo an toàn.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="oldPass" className="font-semibold text-slate-700">Mật khẩu hiện tại</Label>
                        <Input
                          id="oldPass"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPass" className="font-semibold text-slate-700">Mật khẩu mới</Label>
                        <Input
                          id="newPass"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPass" className="font-semibold text-slate-700">Xác nhận mật khẩu</Label>
                        <Input
                          id="confirmPass"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-slate-50">
                      <Button 
                        type="submit" 
                        disabled={isChangingPass}
                        variant="destructive"
                        className="h-11 px-8 rounded-xl shadow-lg shadow-red-500/10 transition-all"
                      >
                        {isChangingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isChangingPass ? "Đang xử lý..." : "Đổi mật khẩu"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
