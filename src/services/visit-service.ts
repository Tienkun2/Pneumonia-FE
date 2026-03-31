import { apiClient } from "./api-client";
import { ApiResponse, PageResponse } from "@/types/api";
import { Visit, CreateVisitPayload } from "@/types/visit";

export const VisitService = {
  async getAllVisits(page: number = 1, size: number = 10): Promise<PageResponse<Visit>> {
    const res = await apiClient(`/visits?page=${page}&size=${size}`, {
      method: "GET",
    });

    const data: ApiResponse<PageResponse<Visit>> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch all visits");
    }

    return data.result;
  },

  async getPatientVisits(patientId: string): Promise<Visit[]> {
    const res = await apiClient(`/patients/${patientId}/visits`, {
      method: "GET",
    });

    const data: ApiResponse<Visit[]> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch visits for patient");
    }

    return data.result;
  },

  async createVisit(payload: CreateVisitPayload): Promise<Visit> {
    const res = await apiClient("/visits", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<Visit> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to create visit");
    }

    return data.result;
  },

  async updateVisit(id: string, payload: Partial<CreateVisitPayload>): Promise<Visit> {
    const res = await apiClient(`/visits/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<Visit> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to update visit");
    }

    return data.result;
  },

  async deleteVisit(id: string): Promise<boolean> {
    const res = await apiClient(`/visits/${id}`, {
      method: "DELETE",
    });

    const data: ApiResponse<unknown> = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to delete visit");
    }

    return true;
  },
};
