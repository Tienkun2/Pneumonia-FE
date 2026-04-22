import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService } from "@/services/device-service";
import { toast } from "sonner";

export function useDevices(userId?: string, forcedEnable?: boolean) {
  const queryClient = useQueryClient();
  const prevRememberedRef = useRef<boolean | undefined>(undefined);

  const myDevicesQuery = useQuery({
    queryKey: ["my-devices"],
    queryFn: DeviceService.getMyDevices,
    staleTime: 0, // Luôn lấy dữ liệu mới nhất
    refetchInterval: 30 * 1000, // Kiểm tra lại sau mỗi 30 giây
    enabled: forcedEnable || (!userId && typeof window !== "undefined" && !!(localStorage.getItem("token") || sessionStorage.getItem("token")))
  });

  useEffect(() => {
    if (!userId && myDevicesQuery.data && typeof window !== "undefined") {
      const currentDevice = myDevicesQuery.data.find(d => d.current);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (currentDevice && token) {
        const isPersistent = !!localStorage.getItem("token");
        
        // Coi như thiết bị mất tin cậy nếu status là "Bị thu hồi" HOẶC remembered là false
        const isCurrentlyTrusted = currentDevice.remembered && currentDevice.status !== "Bị thu hồi";

        // CHỈ HẠ CẤP PHIÊN (Ghi nhớ -> Phiên), KHÔNG LOGOUT CỨNG
        // Điều này cho phép user dùng nốt phiên hiện tại nhưng lần sau phải login lại
        if (isPersistent && prevRememberedRef.current === true && !isCurrentlyTrusted) {
          localStorage.removeItem("token");
          sessionStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; SameSite=Lax`;
          toast.info("Ghi nhớ đăng nhập đã bị thu hồi. Bạn sẽ cần đăng nhập lại ở phiên sau.");
        }

        prevRememberedRef.current = isCurrentlyTrusted;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-devices"] });
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      toast.success("Đã thu hồi thiết bị thành công");
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
