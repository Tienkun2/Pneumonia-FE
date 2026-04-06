import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AuthState, LoginRequest, LoginResponse } from "@/types/auth"
import { AuthService } from "@/services/auth-service"
import { UserService } from "@/services/user-service"
import { User } from "@/types/user"

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  hasFetchedUser: false
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
    if (typeof globalThis === "undefined" || !globalThis.localStorage) return null;
    let token = globalThis.localStorage.getItem("token");
    if (!token) {
      // Fallback: Check cookie if localStorage is empty to sync state with middleware
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) {
        token = match[2];
        localStorage.setItem("token", token);
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

      if (typeof globalThis !== "undefined" && globalThis.localStorage) {
        globalThis.localStorage.setItem("token", action.payload)
        document.cookie = `token=${action.payload}; path=/; max-age=86400; SameSite=Lax`
      }
    },

    logout(state) {
      state.token = null
      state.isAuthenticated = false
      state.user = null
      state.hasFetchedUser = false

      if (typeof globalThis !== "undefined" && globalThis.localStorage) {
        globalThis.localStorage.removeItem("token")
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
        if (typeof globalThis !== "undefined" && globalThis.localStorage) {
          globalThis.localStorage.setItem("token", action.payload.token)
          document.cookie = `token=${action.payload.token}; path=/; max-age=86400; SameSite=Lax`
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
        state.isLoading = true
        state.hasFetchedUser = true
        state.error = null
      })
      .addCase(fetchMyInfo.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(fetchMyInfo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Lỗi tải thông tin cá nhân"
      })
  }
})

export const { setToken, logout } = authSlice.actions
export default authSlice.reducer