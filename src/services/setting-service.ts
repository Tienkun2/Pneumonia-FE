import { api } from "@/services/api-client";
import { SystemSettings, UserSettings } from "@/types";

export const SettingService = {
  getSystemSettings: async () => {
    const response = await api.get<SystemSettings>("/settings/system");
    return response;
  },

  updateSystemSettings: async (settings: SystemSettings) => {
    const response = await api.put<SystemSettings>("/settings/system", settings);
    return response;
  },

  getUserSettings: async () => {
    const response = await api.get<UserSettings>("/settings/user");
    return response;
  },

  updateUserSettings: async (settings: UserSettings) => {
    const response = await api.put<UserSettings>("/settings/user", settings);
    return response;
  }
};
