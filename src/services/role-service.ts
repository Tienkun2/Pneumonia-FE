import { apiClient } from "./api-client";
import { ApiResponse } from "@/types/api";
import { Role } from "@/types/user";

export const RoleService = {
  async getRoles() {
    const res = await apiClient("/roles", {
      method: "GET",
    });

    const data: ApiResponse<Role[]> = await res.json();
    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Failed to fetch roles");
    }

    return data.result || [];
  },
};
