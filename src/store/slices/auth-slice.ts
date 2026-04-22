import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AuthState, LoginRequest, LoginResponse } from "@/types/auth"
import { AuthService } from "@/services/auth-service"
import { UserService } from "@/services/user-service"
import { User } from "@/types/user"

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInfoLoading: false,
  error: null,
  user: null,
  hasFetchedUser: false
}

export const login = createAsyncThunk<
  LoginResponse & { remember?: boolean },
  LoginRequest,
  { rejectValue: string }
>("auth/login", async ({ username, password, remember }, { rejectWithValue }) => {
  try {
    const result = await AuthService.login(username, password)
    return { ...result, remember }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Đăng nhập thất bại"
    return rejectWithValue(message)
  }
})

export const activateAccount = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: string }
>(
  "auth/activate",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await AuthService.activate(token, password)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Kích hoạt thất bại"
      return rejectWithValue(message)
    }
  }
)

export const restoreSession = createAsyncThunk<string | null>(
  "auth/restoreSession",
  async () => {
    if (typeof globalThis === "undefined") return null;
    let token = globalThis.localStorage?.getItem("token") || globalThis.sessionStorage?.getItem("token");
    if (!token && typeof document !== "undefined") {
      // Fallback: Check cookie if storages are empty
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) {
        token = match[2];
        // Don't auto-save to localStorage here as we don't know if it was trusted
      }
    }
    return token;
  }
)

export const logoutThunk = createAsyncThunk(
  "auth/logoutAction",
  async (_, { dispatch }) => {
    await AuthService.logout()
    dispatch(logout())
  }
)

export const fetchMyInfo = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchMyInfo", async (_, { rejectWithValue }) => {
  try {
    return await UserService.getMyInfo()
  } catch (error: unknown) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Không thể lấy thông tin người dùng"
    )
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      state.isAuthenticated = true

      if (typeof globalThis !== "undefined") {
        const hasPersistentToken = !!globalThis.localStorage?.getItem("token")

        if (hasPersistentToken) {
          globalThis.localStorage?.setItem("token", action.payload)
          // Maintain 30 days for persistent sessions
          document.cookie = `token=${action.payload}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
        } else {
          // Stay in session-only mode
          globalThis.sessionStorage?.setItem("token", action.payload)
          document.cookie = `token=${action.payload}; path=/; SameSite=Lax`
        }
      }
    },

    logout(state) {
      state.token = null
      state.isAuthenticated = false
      state.user = null
      state.hasFetchedUser = false

      if (typeof globalThis !== "undefined") {
        globalThis.localStorage?.removeItem("token")
        globalThis.sessionStorage?.removeItem("token")
        globalThis.sessionStorage?.removeItem("hide-trust-prompt")
        document.cookie = "token=; Max-Age=0; path=/"
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

        if (typeof globalThis !== "undefined") {
          const { token } = action.payload;
          
          // By default, store in sessionStorage (per current session)
          globalThis.sessionStorage?.setItem("token", token)
          
          // DO NOT set cookie here to prevent middleware from auto-redirecting
          // while we are showing the Trusted Device prompt on the Login page.
          // The cookie will be set in TrustedDevicePrompt or setToken.
          
          // Clear any old persistent tokens
          globalThis.localStorage?.removeItem("token")
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          action.payload || action.error.message || "Đăng nhập thất bại"
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload
          state.isAuthenticated = true
        }
      })
      .addCase(activateAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(activateAccount.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(activateAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          action.payload || action.error.message || "Kích hoạt thất bại"
      })
      .addCase(logoutThunk.fulfilled, (state) => {
      })
      .addCase(fetchMyInfo.pending, (state) => {
        state.isInfoLoading = true
        state.hasFetchedUser = true
        state.error = null
      })
      .addCase(fetchMyInfo.fulfilled, (state, action) => {
        state.isInfoLoading = false
        state.user = action.payload
      })
      .addCase(fetchMyInfo.rejected, (state, action) => {
        state.isInfoLoading = false
        state.error = action.payload || "Lỗi tải thông tin cá nhân"
      })
  }
})

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer
