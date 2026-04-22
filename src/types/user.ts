import { Role } from "./role";

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  dob?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
  roles: Role[];
  deviceCount?: number;
  sessionCount?: number;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password?: string;
  displayName?: string;
  dob?: string;
}

export interface UpdateUserPayload {
  username?: string;
  displayName?: string;
  dob?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  roles?: string[];
}

export interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

