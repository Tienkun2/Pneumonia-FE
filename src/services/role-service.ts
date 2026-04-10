import { api } from "@/services/api-client";
import { Role } from "@/types/user";

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: string[]; // List of permission names
}

export const RoleService = {
  getRoles: () => api.get<Role[]>("/roles"),

  createRole: (payload: CreateRolePayload) => api.post<Role>("/roles", payload),

  deleteRole: (name: string) => api.delete<void>(`/roles/${name}`),

  updateRole: (name: string, payload: Partial<CreateRolePayload>) => 
    api.put<Role>(`/roles/${name}`, payload),
};
