import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Patient, CreatePatientPayload } from "@/types/patient";
import { PageResponse } from "@/types/api";
import { PatientService } from "@/services/patient-service";

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const initialState: PatientState = {
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
};

export const fetchPatients = createAsyncThunk<PageResponse<Patient>, { page?: number; size?: number }, { rejectValue: string }>(
  "patient/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      return await PatientService.getPatients(page, size);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy danh sách bệnh nhân");
    }
  }
);

export const fetchPatientById = createAsyncThunk<Patient, string, { rejectValue: string }>(
  "patient/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await PatientService.getPatientById(id);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi lấy thông tin bệnh nhân");
    }
  }
);

export const createPatientThunk = createAsyncThunk<Patient, CreatePatientPayload, { rejectValue: string }>(
  "patient/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await PatientService.createPatient(payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi tạo bệnh nhân");
    }
  }
);

export const updatePatientThunk = createAsyncThunk<Patient, { id: string; payload: Partial<CreatePatientPayload> }, { rejectValue: string }>(
  "patient/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await PatientService.updatePatient(id, payload);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi cập nhật bệnh nhân");
    }
  }
);

export const deletePatientThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  "patient/delete",
  async (id, { rejectWithValue }) => {
    try {
      await PatientService.deletePatient(id);
      return id; // Return ID to remove from state
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || "Lỗi khi xoá bệnh nhân");
    }
  }
);

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Patients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload.data;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu";
      });

    // Fetch Patient by ID
    builder
      .addCase(fetchPatientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu bệnh nhân";
      });

    // Create Patient
    builder
      .addCase(createPatientThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatientThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentPage === 1) {
          state.patients.unshift(action.payload);
        }
        state.totalElements += 1;
      })
      .addCase(createPatientThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi tạo mới";
      });

    // Update Patient
    builder
      .addCase(updatePatientThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatientThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.patients.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          state.patients[idx] = action.payload;
        }
        if (state.selectedPatient?.id === action.payload.id) {
          state.selectedPatient = action.payload;
        }
      })
      .addCase(updatePatientThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi cập nhật";
      });

    // Delete Patient
    builder
      .addCase(deletePatientThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePatientThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = state.patients.filter(p => p.id !== action.payload);
        state.totalElements = Math.max(0, state.totalElements - 1);
        if (state.selectedPatient?.id === action.payload) {
          state.selectedPatient = null;
        }
      })
      .addCase(deletePatientThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Lỗi khi xoá";
      });
  },
});

export const { clearError } = patientSlice.actions;
export default patientSlice.reducer;
