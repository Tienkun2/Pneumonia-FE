import { apiClient } from "./api-client";
import { ApiResponse, PageResponse } from "@/types/api";
import { Patient, CreatePatientPayload } from "@/types/patient";

export const PatientService = {
  async getPatients(page: number = 1, size: number = 10, filters?: Record<string, string | number | boolean | string[] | undefined>): Promise<PageResponse<Patient>> {
    let query = `/patients?page=${page}&size=${size}`;
    if (filters?.search) query += `&search=${encodeURIComponent(String(filters.search))}`;
    if (filters?.gender) query += `&gender=${encodeURIComponent(String(filters.gender))}`;
    if (filters?.startDate) query += `&startDate=${encodeURIComponent(String(filters.startDate))}`;
    if (filters?.endDate) query += `&endDate=${encodeURIComponent(String(filters.endDate))}`;

    const res = await apiClient(query, {
      method: "GET",
    });

    const data: ApiResponse<PageResponse<Patient>> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch patients");
    }

    return data.result;
  },

  async getPatientById(id: string): Promise<Patient> {
    const res = await apiClient(`/patients/${id}`, {
      method: "GET",
    });

    const data: ApiResponse<Patient> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch patient detail");
    }

    return data.result;
  },

  async createPatient(payload: CreatePatientPayload): Promise<Patient> {
    const res = await apiClient("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<Patient> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to create patient");
    }

    return data.result;
  },

  async updatePatient(id: string, payload: Partial<CreatePatientPayload>): Promise<Patient> {
    const res = await apiClient(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<Patient> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to update patient");
    }

    return data.result;
  },

  async deletePatient(id: string): Promise<boolean> {
    const res = await apiClient(`/patients/${id}`, {
      method: "DELETE",
    });

    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to delete patient");
    }

    return true;
  },
};
