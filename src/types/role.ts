import { Permission } from "./permission";

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
  status?: string;
  createdAt?: string;
}

export interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}
