"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Shield, 
  User, 
  Globe, 
  Moon, 
  Sun, 
  Database, 
  RefreshCcw,
  Key,
  Loader2,
  Stethoscope
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsView() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";

  const handleSave = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Cài đặt đã được cập nhật thành công");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cài đặt hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý cấu hình tài khoản, thông báo và bảo mật hệ thống.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6">
          <TabsTrigger value="general" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
            <Globe className="h-4 w-4" /> Chung
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
            <Bell className="h-4 w-4" /> Thông báo
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
            <Shield className="h-4 w-4" /> Bảo mật
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
            <Database className="h-4 w-4" /> Hệ thống
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Giao diện & Ngôn ngữ</CardTitle>
              <CardDescription>Tùy chỉnh cách hệ thống hiển thị với bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Chế độ tối (Dark Mode)</Label>
                  <p className="text-sm text-muted-foreground">Chuyển đổi giao diện sang tông màu tối để bảo vệ mắt.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <Switch 
                    checked={isDarkMode} 
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
                  />
                  <Moon className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Ngôn ngữ hệ thống</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="vi">Tiếng Việt (Mặc định)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Dữ liệu cá nhân</CardTitle>
              <CardDescription>Thông tin cơ bản hiển thị trên hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên đơn vị/Phòng khám</Label>
                  <Input placeholder="Phòng khám Nhi Đồng" defaultValue="Bệnh Viện Nhi Trung Ương" />
                </div>
                <div className="space-y-2">
                  <Label>Mã định danh hệ thống</Label>
                  <Input placeholder="Clinic ID" defaultValue="VH-CHILD-001" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Cài đặt thông báo</CardTitle>
              <CardDescription>Chọn cách bạn muốn nhận thông báo từ hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "Thông báo chẩn đoán mới", desc: "Nhận thông báo khi AI hoàn tất phân tích X-quang.", icon: Stethoscope },
                { title: "Thông báo hệ thống", desc: "Cập nhật về các bảo trì hoặc thay đổi lớn của hệ thống.", icon: RefreshCcw },
                { title: "Thông báo bệnh nhân", desc: "Cập nhật khi có dữ liệu bệnh nhi mới được thêm vào.", icon: User },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Bảo mật tài khoản</CardTitle>
              <CardDescription>Cập nhật mật khẩu và phương thức xác thực.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-12 shadow-sm">
                  <Key className="h-4 w-4" /> Đổi mật khẩu định kỳ
                </Button>
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="space-y-0.5">
                    <Label className="text-primary">Xác thực 2 yếu tố (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Tăng thêm một lớp bảo mật cho tài khoản bác sĩ.</p>
                  </div>
                  <Switch color="primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Cấu hình API kết nối</CardTitle>
              <CardDescription>Dành cho quản trị viên hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Backend URL</Label>
                <Input defaultValue="http://localhost:8080/api/v1" />
              </div>
              <div className="space-y-2">
                <Label>WebSocket Endpoint</Label>
                <Input defaultValue="ws://localhost:8080/ws" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button variant="ghost" className="rounded-xl">Hủy bỏ</Button>
        <Button 
          className="rounded-xl px-8" 
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Lưu tất cả cài đặt
        </Button>
      </div>
    </div>
  );
}
