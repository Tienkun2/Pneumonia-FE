import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SettingService } from "@/services/setting-service";
import { toast } from "sonner";

export function useSettings() {
  const queryClient = useQueryClient();

  // System Settings
  const systemSettingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: SettingService.getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // User Settings
  const userSettingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: SettingService.getUserSettings,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const systemError = systemSettingsQuery.error as Error | null;
    const userError = userSettingsQuery.error as Error | null;
    
    if (systemError || userError) {
      let message = systemError?.message || userError?.message || "Lỗi tải cài đặt";
      
      if (message === "Failed to fetch" || message.includes("NetworkError")) {
        message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền hoặc thử lại sau.";
      }
      
      toast.error(message, { id: "settings-fetch-error" });
    }
  }, [systemSettingsQuery.error, userSettingsQuery.error]);

  const updateSystemSettingsMutation = useMutation({
    mutationFn: SettingService.updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });

  const updateUserSettingsMutation = useMutation({
    mutationFn: SettingService.updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });

  return {
    systemSettings: systemSettingsQuery.data,
    isSystemLoading: systemSettingsQuery.isLoading,
    updateSystemSettings: updateSystemSettingsMutation.mutateAsync,
    isSystemUpdating: updateSystemSettingsMutation.isPending,

    userSettings: userSettingsQuery.data,
    isUserLoading: userSettingsQuery.isLoading,
    updateUserSettings: updateUserSettingsMutation.mutateAsync,
    isUserUpdating: updateUserSettingsMutation.isPending,
  };
}
