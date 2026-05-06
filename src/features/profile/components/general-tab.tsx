"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchMyInfo } from "@/store/slices/auth-slice";
import { updateUserThunk } from "@/store/slices/user-slice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, Mail, Phone, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/types/user";

interface GeneralTabProps {
  user: UserType;
}

export function GeneralTab({ user }: GeneralTabProps) {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [dob, setDob] = useState(user.dob?.split("T")[0] || "");

  useEffect(() => {
    setDisplayName(user.displayName || "");
    setPhoneNumber(user.phoneNumber || "");
    setDob(user.dob?.split("T")[0] || "");
  }, [user]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  }, [user.id, displayName, phoneNumber, dob, dispatch]);

  return (
    <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
        <CardTitle className="text-lg font-bold text-foreground">Cập nhật hồ sơ</CardTitle>
        <CardDescription className="text-xs">Thay đổi thông tin liên lạc và hiển thị của bạn</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
  );
}
