import { api } from "@/services/api-client";
import { UserDevice } from "@/utils/device-schemas";

export const DeviceService = {
  getMyDevices: async () => {
    const response = await api.get<UserDevice[]>("/user-devices/my-devices");
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
    return api.patch<void>(`/user-devices/${deviceId}/trust`);
  },

  revokeDevice: async (deviceId: string) => {
    return api.patch<void>(`/user-devices/${deviceId}/revoke`);
  }
};
