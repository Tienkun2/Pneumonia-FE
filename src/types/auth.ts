export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  authenticated: boolean
}

import { User } from "./user"

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: User | null
  hasFetchedUser: boolean
}
