import { api } from "@/services/api-client";
import { UserSession } from "@/utils/session-schemas";
import { PageResponse } from "@/types/api";

export const SessionService = {
  getUserSessions: async (userId: string, page: number = 1, size: number = 10) => {
    return api.get<PageResponse<UserSession> | UserSession[]>(`/user-sessions/user/${userId}?page=${page}&size=${size}`);
  },

  revokeSession: async (sessionId: string) => {
    return api.delete<unknown>(`/user-sessions/${sessionId}`);
  },
};
