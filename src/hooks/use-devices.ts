import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService } from "@/services/device-service";
import { UserDevice } from "@/utils/device-schemas";
import { toast } from "sonner";
import { DEVICE_STATUS } from "@/constants/device";

export function useDevices(userId?: string, forcedEnable?: boolean) {
  const queryClient = useQueryClient();
  const prevRememberedRef = useRef<boolean | undefined>(undefined);

  const myDevicesQuery = useQuery({
    queryKey: ["my-devices"],
    queryFn: () => DeviceService.getMyDevices({ skipAutoLogout: true }),
    staleTime: 0,
    refetchInterval: 30 * 1000,
    enabled: forcedEnable || (!userId && typeof window !== "undefined" && !!(localStorage.getItem("token") || sessionStorage.getItem("token")))
  });

  useEffect(() => {
    if (!userId && myDevicesQuery.data && typeof window !== "undefined") {
      const currentDevice = myDevicesQuery.data.find(d => d.current);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (currentDevice && token) {
        const isPersistent = !!localStorage.getItem("token");

        const isCurrentlyTrusted = currentDevice.remembered && currentDevice.status !== DEVICE_STATUS.REVOKED;

        if (isPersistent && prevRememberedRef.current === true && !isCurrentlyTrusted) {
          localStorage.removeItem("token");
          sessionStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; SameSite=Lax`;
          toast.info("Thiết bị này đã bị thu hồi quyền tin cậy. Bạn sẽ cần đăng nhập lại ở lần truy cập sau.");
        }

        prevRememberedRef.current = currentDevice.remembered;
      }
    }
  }, [myDevicesQuery.data, userId]);

  const userDevicesQuery = useQuery({
    queryKey: ["user-devices", userId],
    queryFn: () => DeviceService.getUserDevices(userId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: DeviceService.revokeDevice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-devices"] });
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });

      const currentDevice = queryClient.getQueryData<UserDevice[]>(["my-devices"])?.find(d => d.current);
      if (currentDevice?.id !== variables) {
        toast.success("Đã thu hồi thiết bị thành công");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const trustDeviceMutation = useMutation({
    mutationFn: DeviceService.trustDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-devices"] });
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return {
    devices: userId ? userDevicesQuery.data || [] : myDevicesQuery.data || [],
    isLoading: userId ? userDevicesQuery.isLoading : myDevicesQuery.isLoading,
    revokeDevice: revokeDeviceMutation.mutate,
    isRevoking: revokeDeviceMutation.isPending,
    trustDevice: trustDeviceMutation.mutateAsync,
    isTrusting: trustDeviceMutation.isPending
  };
}
