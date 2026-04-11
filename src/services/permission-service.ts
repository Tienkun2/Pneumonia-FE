import { api } from "@/services/api-client";
import { Permission, PermissionTreeNode } from "@/types/permission";

export const PermissionService = {
  getPermissions: () => api.get<Permission[]>("/permissions"),

  getPermissionTree: (roleName: string) => 
    api.get<PermissionTreeNode[]>(`/permissions/tree?roleName=${roleName}`),

  getRoots: (roleName?: string) => {
    const query = roleName ? `?roleName=${roleName}` : "";
    return api.get<PermissionTreeNode[]>(`/permissions/roots${query}`);
  },

  getChildren: (parentName: string, roleName?: string) => {
    const query = roleName ? `?roleName=${roleName}` : "";
    return api.get<PermissionTreeNode[]>(`/permissions/children/${parentName}${query}`);
  },

  createPermission: (payload: Permission) => 
    api.post<Permission>("/permissions", payload),

  deletePermission: (name: string) => 
    api.delete<void>(`/permissions/${name}`),
};
