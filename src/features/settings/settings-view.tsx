"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Globe, 
  Settings, 
  Loader2, 
  Check, 
  RefreshCcw 
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useAppSelector } from "@/store/hooks";
import { GeneralSettingsTab } from "./components/general-settings-tab";
import { NotificationSettingsTab } from "./components/notification-settings-tab";
import { SystemSettings, UserSettings } from "@/types";
import { toast } from "sonner";

const TABS = [
  { value: "general",       icon: Globe,    label: "Chung" },
  { value: "notifications", icon: Bell,     label: "Thông báo" },
];

export default function SettingsView() {
  const { 
    systemSettings, isSystemLoading, updateSystemSettings, isSystemUpdating,
    userSettings, isUserLoading, updateUserSettings, isUserUpdating 
  } = useSettings();

  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.some(r => r.name === "ADMIN");

  // Local state for pending changes with basic defaults
  const [localSystem, setLocalSystem] = useState<SystemSettings>({
    hospitalName: "",
    systemId: ""
  });
  
  const [localUser, setLocalUser] = useState<UserSettings>({
    darkMode: false,
    language: "vi",
    notifyDiagnosis: true,
    notifySystem: true,
    notifyPatient: true,
    notifyPush: false,
    notifySecurity: true
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (systemSettings) setLocalSystem(systemSettings);
  }, [systemSettings]);

  useEffect(() => {
    if (userSettings) setLocalUser(userSettings);
  }, [userSettings]);

  const handleSaveAll = async () => {
    try {
      const savePromises = [
        localUser ? updateUserSettings(localUser) : Promise.resolve()
      ];

      if (isAdmin && localSystem) {
        savePromises.push(updateSystemSettings(localSystem));
      }

      await Promise.all(savePromises);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      toast.success('Tất cả cài đặt đã được lưu thành công!');
    } catch (err: unknown) {
      const error = err as Error;
      const message = error.message || '';
      const displayMessage = message === "Failed to fetch" 
        ? "Không thể kết nối đến máy chủ để lưu cài đặt." 
        : (message || 'Có lỗi xảy ra khi lưu cài đặt');
      
      toast.error(displayMessage, { id: "settings-save-error" });
    }
  };

  const isLoading = isSystemLoading || isUserLoading;
  const isUpdating = isSystemUpdating || isUserUpdating;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      <PageHeader
        title="Cài đặt hệ thống"
        icon={Settings}
      />

      <Tabs defaultValue="general" className="space-y-5">
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-1.5">
          <TabsList className="bg-transparent w-full grid grid-cols-2 gap-1 h-auto">
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

        <TabsContent value="general" className="space-y-4 mt-0">
          <GeneralSettingsTab 
            systemSettings={localSystem} 
            userSettings={localUser}
            onUpdateSystem={setLocalSystem}
            onUpdateUser={setLocalUser}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-0">
          <NotificationSettingsTab 
            userSettings={localUser}
            onUpdateUser={setLocalUser}
          />
        </TabsContent>
      </Tabs>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-20 flex justify-end gap-3 bg-card/80 backdrop-blur-md border border-border/30 rounded-2xl shadow-xl px-5 py-3">
        <Button
          variant="outline"
          onClick={() => {
            if (systemSettings) setLocalSystem(systemSettings);
            if (userSettings) setLocalUser(userSettings);
          }}
          className="rounded-xl text-[13px] font-bold border-border/50 hover:bg-muted/30"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSaveAll}
          disabled={isUpdating}
          className="rounded-xl px-6 text-[13px] font-bold gap-2 shadow-md shadow-primary/20 min-w-[160px]"
        >
          {isUpdating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
          ) : isSaved ? (
            <><Check className="h-4 w-4" /> Đã lưu!</>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Lưu tất cả cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
