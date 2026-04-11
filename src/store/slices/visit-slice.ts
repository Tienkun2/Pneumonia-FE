import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Visit, CreateVisitPayload, VisitState } from "@/types/diagnosis";
import { PageResponse } from "@/types/api";
import { VisitService } from "@/services/visit-service";

const initialState: VisitState = {
  visits: [],
  isLoading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
};
export const fetchAllVisits = createAsyncThunk<PageResponse<Visit>, { page?: number; size?: number } | void, { rejectValue: string }>(
  "visit/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      return await VisitService.getAllVisits(page, size);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy danh sách lượt khám");
    }
  }
);
export const fetchPatientVisits = createAsyncThunk<Visit[], string, { rejectValue: string }>(
  "visit/fetchByPatientId",
  async (patientId, { rejectWithValue }) => {
    try {
      return await VisitService.getPatientVisits(patientId);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy danh sách lượt khám");
    }
  }
);

export const createVisitThunk = createAsyncThunk<Visit, CreateVisitPayload, { rejectValue: string }>(
  "visit/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await VisitService.createVisit(payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi tạo lượt khám");
    }
  }
);

export const updateVisitThunk = createAsyncThunk<Visit, { id: string; payload: Partial<CreateVisitPayload> }, { rejectValue: string }>(
  "visit/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await VisitService.updateVisit(id, payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi cập nhật lượt khám");
    }
  }
);

export const deleteVisitThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  "visit/delete",
  async (id, { rejectWithValue }) => {
    try {
      await VisitService.deleteVisit(id);
      return id; // Return ID to remove from state
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi xoá lượt khám");
    }
  }
);

const visitSlice = createSlice({
  name: "visit",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Visits
    builder
      .addCase(fetchPatientVisits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientVisits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visits = action.payload;
      })
      .addCase(fetchPatientVisits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu";
      });

    // Fetch All Visits
    builder
      .addCase(fetchAllVisits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVisits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visits = action.payload.data;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchAllVisits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải danh sách lượt khám";
      });

    // Create Visit
    builder
      .addCase(createVisitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVisitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visits.unshift(action.payload);
      })
      .addCase(createVisitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tạo mới lượt khám";
      });

    // Update Visit
    builder
      .addCase(updateVisitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVisitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.visits.findIndex(v => v.id === action.payload.id);
        if (idx !== -1) {
          state.visits[idx] = action.payload;
        }
      })
      .addCase(updateVisitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi cập nhật lượt khám";
      });

    // Delete Visit
    builder
      .addCase(deleteVisitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVisitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visits = state.visits.filter(v => v.id !== action.payload);
      })
      .addCase(deleteVisitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi khi xoá lượt khám";
      });
  },
});

export const { clearError } = visitSlice.actions;
export default visitSlice.reducer;
