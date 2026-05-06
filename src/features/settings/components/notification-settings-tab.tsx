"use client";

import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Stethoscope, 
  RefreshCcw, 
  User, 
  ShieldCheck 
} from "lucide-react";
import { UserSettings } from "@/types";

interface NotificationSettingsTabProps {
  userSettings: UserSettings;
  onUpdateUser: (settings: UserSettings) => void;
}

function SettingSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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

function SettingRow({ icon: Icon, iconBg = "bg-muted", iconColor = "text-muted-foreground", title, description, children }: { icon: React.ElementType; iconBg?: string; iconColor?: string; title: string; description: string; children: React.ReactNode }) {
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

export function NotificationSettingsTab({ userSettings, onUpdateUser }: NotificationSettingsTabProps) {
  const NOTIFICATION_ITEMS = [
    {
      key: "notifyDiagnosis" as const,
      icon: Stethoscope, bg: "bg-primary/10", color: "text-primary",
      title: "Thông báo chẩn đoán mới",
      desc: "Nhận thông báo khi AI hoàn tất phân tích X-quang",
    },
    {
      key: "notifySystem" as const,
      icon: RefreshCcw, bg: "bg-blue-500/10", color: "text-blue-600",
      title: "Thông báo hệ thống",
      desc: "Cập nhật về bảo trì hoặc thay đổi lớn của hệ thống",
    },
    {
      key: "notifyPatient" as const,
      icon: User, bg: "bg-emerald-500/10", color: "text-emerald-600",
      title: "Thông báo bệnh nhân",
      desc: "Nhận thông báo khi có dữ liệu bệnh nhân hoặc lượt khám mới",
    },
    {
      key: "notifySecurity" as const,
      icon: ShieldCheck, bg: "bg-red-500/10", color: "text-red-600",
      title: "Thông báo bảo mật",
      desc: "Cảnh báo đăng nhập mới, đổi mật khẩu hoặc thu hồi phiên làm việc",
    },
    {
      key: "notifyPush" as const,
      icon: Bell, bg: "bg-amber-500/10", color: "text-amber-600",
      title: "Thông báo đẩy (Push)",
      desc: "Nhận thông báo ngay cả khi không mở ứng dụng",
    },
  ];

  const handleToggle = (key: keyof UserSettings) => {
    if (!userSettings) return;
    onUpdateUser({
      ...userSettings,
      [key]: !userSettings[key]
    });
  };

  return (
    <div className="space-y-4">
      <SettingSection title="Cài đặt thông báo" description="Chọn các loại thông báo bạn muốn nhận từ hệ thống">
        {NOTIFICATION_ITEMS.map((item) => (
          <SettingRow
            key={item.key}
            icon={item.icon}
            iconBg={item.bg}
            iconColor={item.color}
            title={item.title}
            description={item.desc}
          >
            <Switch 
              checked={!!userSettings?.[item.key]} 
              onCheckedChange={() => handleToggle(item.key)}
            />
          </SettingRow>
        ))}
      </SettingSection>
    </div>
  );
}
