import { apiClient } from "./api-client";
import { ApiResponse, PageResponse } from "@/types/api";
import { User, CreateUserPayload } from "@/types/user";

export const UserService = {
  async getUsers(page: number = 1, size: number = 10, filters: Record<string, unknown> = {}) {
    let query = `/users?page=${page}&size=${size}`;
    if (filters.search) query += `&search=${encodeURIComponent(String(filters.search))}`;
    if (filters.status) query += `&status=${encodeURIComponent(String(filters.status))}`;
    if (filters.role) query += `&role=${encodeURIComponent(String(filters.role))}`;

    const res = await apiClient(query, {
      method: "GET",
    });

    const data: ApiResponse<PageResponse<User>> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data.result;
  },

  async createUser(payload: CreateUserPayload) {
    const res = await apiClient("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<User> = await res.json();
    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Failed to create user");
    }

    return data.result;
  },

  async updateUser(id: string, payload: import("@/types/user").UpdateUserPayload) {
    const res = await apiClient(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<User> = await res.json();
    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Failed to update user");
    }

    return data.result;
  },

  async deleteUser(id: string) {
    const finalRes = await apiClient(`/users/${id}`, {
       method: "DELETE"
    })

    const data: ApiResponse<unknown> = await finalRes.json();
    if (!finalRes.ok || data.code !== 0) {
      throw new Error(data.message || "Failed to delete user");
    }

    return true;
  },
};
