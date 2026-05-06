"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SystemSettings, UserSettings } from "@/types";

interface GeneralSettingsTabProps {
  systemSettings: SystemSettings;
  userSettings: UserSettings;
  onUpdateSystem: (settings: SystemSettings) => void;
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

export function GeneralSettingsTab({ systemSettings, userSettings, onUpdateSystem, onUpdateUser }: GeneralSettingsTabProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  return (
    <div className="space-y-6">
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
              onCheckedChange={(c) => {
                setTheme(c ? "dark" : "light");
                if (userSettings) onUpdateUser({ ...userSettings, darkMode: c });
              }}
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
          <select 
            value={userSettings?.language || "vi"}
            onChange={(e) => userSettings && onUpdateUser({ ...userSettings, language: e.target.value })}
            className="h-9 rounded-xl border border-border/50 bg-muted/30 px-3 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Thông tin đơn vị" description="Cấu hình định danh bệnh viện trên hệ thống">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-3">
            <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Tên bệnh viện / Đơn vị</Label>
            <Input
              value={systemSettings?.hospitalName || ""}
              onChange={(e) => systemSettings && onUpdateSystem({ ...systemSettings, hospitalName: e.target.value })}
              className="h-10 rounded-xl border-border/50 text-[13px] font-semibold"
              placeholder="Bệnh viện Đa khoa Tâm Anh"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Mã định danh hệ thống (System ID)</Label>
            <Input
              value={systemSettings?.systemId || ""}
              onChange={(e) => systemSettings && onUpdateSystem({ ...systemSettings, systemId: e.target.value })}
              className="h-10 rounded-xl border-border/50 text-[13px] font-semibold"
              placeholder="HOS-TA-01"
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
