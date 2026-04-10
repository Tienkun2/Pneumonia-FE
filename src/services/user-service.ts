import { api } from "@/services/api-client";
import { PageResponse } from "@/types/api";
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";

/**
 * Senior-level User Service
 * Standardized API calls using central helper
 */
export const UserService = {
  getUsers: (page: number = 1, size: number = 10, filters: Record<string, unknown> = {}) => {
    let query = `/users?page=${page}&size=${size}`;
    if (filters.search) query += `&search=${encodeURIComponent(String(filters.search))}`;
    if (filters.status) query += `&status=${encodeURIComponent(String(filters.status))}`;
    if (filters.role) query += `&role=${encodeURIComponent(String(filters.role))}`;

    return api.get<PageResponse<User>>(query);
  },

  createUser: (payload: CreateUserPayload) => api.post<User>("/users", payload),

  updateUser: (id: string, payload: UpdateUserPayload) => api.put<User>(`/users/${id}`, payload),

  deleteUser: (id: string) => api.delete<unknown>(`/users/${id}`),

  getMyInfo: () => api.get<User>("/users/my-info"),

  changePassword: (oldPassword: string, newPassword: string) => 
    api.post<void>("/users/change-password", { oldPassword, newPassword }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<User>("/users/upload-avatar", formData);
  },
};
