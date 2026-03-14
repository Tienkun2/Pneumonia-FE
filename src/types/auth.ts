export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  authenticated: boolean
}

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}