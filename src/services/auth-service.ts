import { apiClient } from "./api-client"
import { ApiResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth"

export const AuthService = {

  async login(username: string, password: string) {

    const res = await apiClient("/auth/login", {
      method: "POST",
      withAuth: false,
      body: JSON.stringify({
        username,
        password
      })
    })

    const data: ApiResponse<LoginResponse> = await res.json()

    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Login failed")
    }

    return data.result
  },

  async activate(token: string, password: string) {
    const res = await apiClient("/users/set-password", {
      method: "POST",
      withAuth: false,
      body: JSON.stringify({
        token,
        password
      })
    })

    const data: ApiResponse<unknown> = await res.json()

    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Activation failed")
    }

    return data.result
  },

  async logout() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const res = await apiClient("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ token })
      })
      
      const data: ApiResponse<unknown> = await res.json()

      if (!res.ok || data.code !== 0) {
        console.error("Logout API returned error:", data.message)
      }
    } catch (e) {
      console.error("Logout API failed", e)
    }
  },

  async refresh() {
    const res = await apiClient("/auth/refresh", {
      method: "POST"
    })

    const data: ApiResponse<{ token: string }> = await res.json()

    if (!res.ok || data.code !== 0) {
      throw new Error(data.message || "Refresh failed")
    }

    return data.result
  }

}