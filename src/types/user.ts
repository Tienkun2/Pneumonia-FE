export interface Permission {
  name: string;
  description: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
}

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
