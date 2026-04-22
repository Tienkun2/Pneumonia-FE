import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionService } from "@/services/session-service";
import { toast } from "sonner";
import { PageResponse } from "@/types/api";
import { UserSession } from "@/utils/session-schemas";

export function useUserSessions(userId?: string, page: number = 1, size: number = 10) {
  const queryClient = useQueryClient();

  const { data: sessionsPage, isLoading } = useQuery({
    queryKey: ["user-sessions", userId, page, size],
    queryFn: () => SessionService.getUserSessions(userId!, page, size),
    enabled: !!userId,
  });

  const revokeMutation = useMutation({
    mutationFn: SessionService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions", userId] });
      toast.success("Đã thu hồi phiên hoạt động thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể thu hồi phiên. Vui lòng thử lại.");
    },
  });

  // Xử lý linh hoạt: Nếu BE trả về mảng trực tiếp hoặc object PageResponse
  const sessions = Array.isArray(sessionsPage) ? sessionsPage : (sessionsPage as PageResponse<UserSession>)?.data || [];
  const totalPages = Array.isArray(sessionsPage) ? 1 : (sessionsPage as PageResponse<UserSession>)?.totalPages || 0;

  return {
    sessions,
    totalPages,
    isLoading,
    revokeSession: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
  };
}
