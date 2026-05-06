"use client";

import { useState, useCallback } from "react";
import { UserService } from "@/services/user-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, CheckCircle2, AlertCircle, ShieldCheck, Key 
} from "lucide-react";
import { toast } from "sonner";
import { useDevices } from "@/hooks/use-devices";
import { DeviceManagementModal } from "./device-management-modal";

export function SecurityTab() {
  const { devices } = useDevices();
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  return (
    <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Side: Change Password */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Đổi mật khẩu
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex gap-3 text-primary text-[12px] leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Mật khẩu mới phải dài ít nhất 6 ký tự. Hãy sử dụng kết hợp chữ hoa, chữ thường và chữ số.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="oldPass" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mật khẩu hiện tại</Label>
                <Input
                  id="oldPass"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl bg-background border-border text-[13px] focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPass" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mật khẩu mới</Label>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-xl bg-background border-border text-[13px] focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Xác nhận</Label>
                  <Input
                    id="confirmPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-xl bg-background border-border text-[13px] focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isChangingPass}
                className="h-10 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-[13px]"
              >
                {isChangingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isChangingPass ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: 2FA & Account Status */}
        <div className="bg-muted/10 p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Bảo mật nâng cao
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Các tùy chọn bảo vệ tài khoản bổ sung</p>
            </div>

            {/* 2FA Toggle */}
            <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-foreground">Xác thực 2 lớp (2FA)</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Yêu cầu mã OTP khi đăng nhập từ trình duyệt mới</p>
                </div>
                <Switch 
                  checked={is2FAEnabled} 
                  onCheckedChange={(val) => {
                    setIs2FAEnabled(val);
                    toast.success(val ? "Đã bật yêu cầu xác thực 2 lớp" : "Đã tắt xác thực 2 lớp");
                  }} 
                />
              </div>
              
              {is2FAEnabled && (
                 <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
                    <CheckCircle2 className="h-3 w-3" /> Tài khoản đang được bảo vệ
                 </div>
              )}
            </div>

            {/* Account Status Info */}
            <div className="space-y-4 pt-2">
               <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Trạng thái tài khoản</p>
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-[13px]">
                     <span className="text-muted-foreground font-medium">Lần cuối đổi mật khẩu</span>
                     <span className="font-bold text-foreground">3 tháng trước</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                     <span className="text-muted-foreground font-medium">Thiết bị đang kết nối</span>
                     <DeviceManagementModal 
                        isOpen={isDeviceModalOpen} 
                        onOpenChange={setIsDeviceModalOpen} 
                        deviceCount={devices.length}
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
