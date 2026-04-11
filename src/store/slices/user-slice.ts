import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User, CreateUserPayload, UserState } from "@/types/user";
import { PageResponse } from "@/types/api";
import { UserService } from "@/services/user-service";

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
};

export const fetchUsers = createAsyncThunk<PageResponse<User>, { page?: number; size?: number; filters?: Record<string, unknown> } | void, { rejectValue: string }>(
  "user/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      const filters = params?.filters || {};
      return await UserService.getUsers(page, size, filters);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy danh sách user");
    }
  }
);

export const createUser = createAsyncThunk<User, CreateUserPayload, { rejectValue: string }>(
  "user/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await UserService.createUser(payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi tạo user");
    }
  }
);

export const updateUserThunk = createAsyncThunk<User, { id: string; payload: import("@/types/user").UpdateUserPayload }, { rejectValue: string }>(
  "user/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await UserService.updateUser(id, payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi cập nhật user");
    }
  }
);

export const deleteUserThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  "user/delete",
  async (id, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(id);
      return id; // Return ID to remove from state
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi xóa user");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu";
      });

    // Create
    builder
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // The API returns the new user. We push it to the list.
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tạo mới";
      });

    // Update
    builder
      .addCase(updateUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.users.findIndex((u) => u.id === action.payload.id || u.username === action.payload.username);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi cập nhật";
      });

    // Delete
    builder
      .addCase(deleteUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Removing by ID. If API only returned username, fallback to checking username too.
        state.users = state.users.filter((u) => u.id !== action.payload && u.username !== action.payload);
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi khi xóa";
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
