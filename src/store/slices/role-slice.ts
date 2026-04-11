import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Role, RoleState } from "@/types/role";
import { RoleService } from "@/services/role-service";

const initialState: RoleState = {
  roles: [],
  isLoading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk<Role[], void, { rejectValue: string }>(
  "role/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await RoleService.getRoles();
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy danh sách role");
    }
  }
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải roles";
      });
  },
});

export default roleSlice.reducer;
