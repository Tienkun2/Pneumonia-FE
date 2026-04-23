import { api, ApiOptions } from "@/services/api-client";
import { UserDevice } from "@/utils/device-schemas";

export const DeviceService = {
  getMyDevices: async (options?: ApiOptions) => {
    const response = await api.get<UserDevice[]>("/user-devices/my-devices", options);
    return response;
  },

  getUserDevices: async (userId: string) => {
    const response = await api.get<UserDevice[]>(`/user-devices/user/${userId}`);
    return response;
  },

  deleteDevice: async (deviceId: string) => {
    await api.delete<unknown>(`/user-devices/${deviceId}`);
    return true;
  },

  trustDevice: async (deviceId: string) => {
    return api.patch<void>(`/user-devices/${deviceId}/trust`, undefined, { skipAutoLogout: true });
  },

  revokeDevice: async (deviceId: string) => {
    return api.patch<void>(`/user-devices/${deviceId}/revoke`, undefined, { skipAutoLogout: true });
  }
};
