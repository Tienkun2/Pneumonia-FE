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

  logout() {
    // Placeholder for future API logout if needed
  }

}