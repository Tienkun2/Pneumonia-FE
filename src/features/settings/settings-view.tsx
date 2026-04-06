"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Database,
  RefreshCcw,
  Key,
  Loader2,
  Stethoscope,
  User,
  Settings,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";

const TABS = [
  { value: "general",       icon: Globe,    label: "Chung" },
  { value: "notifications", icon: Bell,     label: "Thông báo" },
  { value: "security",      icon: Shield,   label: "Bảo mật" },
  { value: "system",        icon: Database, label: "Hệ thống" },
];

/* ── Reusable setting row ──────────────────────────────────── */
function SettingRow({
  icon: Icon,
  iconBg = "bg-muted",
  iconColor = "text-muted-foreground",
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          <p className="text-[12px] font-medium text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ── Section Card ──────────────────────────────────────────── */
function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/30">
        <h2 className="text-[14px] font-black text-foreground">{title}</h2>
        {description && <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function SettingsView() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  const handleSave = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSaved(true);
      toast.success("Cài đặt đã được cập nhật thành công");
      setTimeout(() => setSaved(false), 2000);
    }, 900);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* ── Header ────────────────────────────────────── */}
      <PageHeader
        title="Cài đặt hệ thống"
        subtitle="Quản lý tài khoản, giao diện, thông báo và bảo mật"
        icon={Settings}
      />

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs defaultValue="general" className="space-y-5">
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-1.5">
          <TabsList className="bg-transparent w-full grid grid-cols-4 gap-1 h-auto">
            {TABS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="
                  flex items-center gap-2 h-9 rounded-xl text-[13px] font-semibold
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground
                  transition-all duration-150
                "
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Tab: Chung ────────────────────────────── */}
        <TabsContent value="general" className="space-y-4 mt-0">
          <SettingSection title="Giao diện & Ngôn ngữ" description="Tuỳ chỉnh cách hệ thống hiển thị với bạn">
            {/* Dark mode */}
            <SettingRow
              icon={isDarkMode ? Moon : Sun}
              iconBg={isDarkMode ? "bg-slate-800" : "bg-amber-500/10"}
              iconColor={isDarkMode ? "text-slate-300" : "text-amber-500"}
              title="Chế độ tối (Dark Mode)"
              description="Chuyển sang tông màu tối, giảm mỏi mắt khi làm việc ban đêm"
            >
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
                />
                <Moon className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </SettingRow>

            {/* Language */}
            <SettingRow
              icon={Globe}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              title="Ngôn ngữ hệ thống"
              description="Chọn ngôn ngữ hiển thị trên toàn bộ giao diện"
            >
              <select className="h-9 rounded-xl border border-border/50 bg-muted/30 px-3 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]">
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </SettingRow>
          </SettingSection>

          <SettingSection title="Dữ liệu cá nhân" description="Thông tin cơ bản hiển thị trên hệ thống">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Tên đơn vị / Phòng khám</Label>
                <Input
                  defaultValue="Bệnh Viện Phổi Trung Ương"
                  className="h-10 rounded-xl border-border/50 text-[13px] font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Mã định danh hệ thống</Label>
                <Input
                  defaultValue="VH-LUNG-001"
                  disabled
                  className="h-10 rounded-xl border-border/50 bg-muted/40 text-[13px] font-semibold text-muted-foreground"
                />
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        {/* ── Tab: Thông báo ────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4 mt-0">
          <SettingSection title="Cài đặt thông báo" description="Chọn cách bạn muốn nhận thông báo từ hệ thống">
            {[
              {
                icon: Stethoscope, bg: "bg-primary/10", color: "text-primary",
                title: "Thông báo chẩn đoán mới",
                desc: "Nhận thông báo khi AI hoàn tất phân tích X-quang",
                defaultOn: true,
              },
              {
                icon: RefreshCcw, bg: "bg-blue-50", color: "text-blue-600",
                title: "Thông báo hệ thống",
                desc: "Cập nhật về bảo trì hoặc thay đổi lớn của hệ thống",
                defaultOn: true,
              },
              {
                icon: User, bg: "bg-emerald-50", color: "text-emerald-600",
                title: "Thông báo bệnh nhân",
                desc: "Nhận thông báo khi có dữ liệu bệnh nhân mới được thêm vào",
                defaultOn: false,
              },
              {
                icon: Bell, bg: "bg-amber-50", color: "text-amber-600",
                title: "Thông báo đẩy (Push)",
                desc: "Nhận thông báo ngay cả khi không mở ứng dụng",
                defaultOn: false,
              },
            ].map((item) => (
              <SettingRow
                key={item.title}
                icon={item.icon}
                iconBg={item.bg}
                iconColor={item.color}
                title={item.title}
                description={item.desc}
              >
                <Switch defaultChecked={item.defaultOn} />
              </SettingRow>
            ))}
          </SettingSection>
        </TabsContent>

        {/* ── Tab: Bảo mật ─────────────────────────── */}
        <TabsContent value="security" className="space-y-4 mt-0">
          <SettingSection title="Bảo mật tài khoản" description="Cập nhật mật khẩu và phương thức xác thực">
            <div className="py-4 space-y-3">
              <button className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-[13px] font-semibold text-foreground">
                <Key className="h-4 w-4 text-muted-foreground" /> Đổi mật khẩu định kỳ
              </button>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary">Xác thực 2 yếu tố (2FA)</p>
                    <p className="text-[12px] font-medium text-muted-foreground mt-0.5">Tăng thêm một lớp bảo mật cho tài khoản </p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        {/* ── Tab: Hệ thống ────────────────────────── */}
        <TabsContent value="system" className="space-y-4 mt-0">
          <SettingSection title="Cấu hình API kết nối" description="Dành cho quản trị viên hệ thống — thay đổi cẩn thận">
            <div className="py-4 space-y-4">
              {[
                { label: "API Backend URL", value: "http://localhost:8080/api/v1" },
                { label: "WebSocket Endpoint", value: "ws://localhost:8080/ws" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{label}</Label>
                  <Input
                    defaultValue={value}
                    className="h-10 rounded-xl border-border/50 font-mono text-[13px]"
                  />
                </div>
              ))}
            </div>
          </SettingSection>
        </TabsContent>
      </Tabs>

      {/* ── Save Bar ──────────────────────────────────── */}
      <div className="sticky bottom-4 flex justify-end gap-3 bg-card/80 backdrop-blur-md border border-border/30 rounded-2xl shadow-xl px-5 py-3">
        <Button
          variant="outline"
          className="rounded-xl text-[13px] font-bold border-border/50 hover:bg-muted/30"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="rounded-xl px-6 text-[13px] font-bold gap-2 shadow-md shadow-primary/20 min-w-[160px]"
        >
          {isUpdating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
          ) : saved ? (
            <><Check className="h-4 w-4" /> Đã lưu!</>
          ) : (
            "Lưu tất cả cài đặt"
          )}
        </Button>
      </div>
    </div>
  );
}
