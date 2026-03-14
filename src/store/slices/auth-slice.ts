import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AuthState, LoginRequest, LoginResponse } from "@/types/auth"
import { AuthService } from "@/services/auth-service"

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const result = await AuthService.login(username, password)
    return result
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Đăng nhập thất bại"
    return rejectWithValue(message)
  }
})

export const restoreSession = createAsyncThunk<string | null, void>(
  "auth/restoreSession",
  async () => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("token")
    return token
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      state.isAuthenticated = true

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload)
      }
    },

    logout(state) {
      state.token = null
      state.isAuthenticated = false

      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null

        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message || "Đăng nhập thất bại"
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        const token = action.payload

        if (token) {
          state.token = token
          state.isAuthenticated = true
        }
      })
  }
})

export const { setToken, logout } = authSlice.actions
export default authSlice.reducer