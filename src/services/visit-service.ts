import { api } from "@/services/api-client";
import { PageResponse } from "@/types/api";
import { Visit, CreateVisitPayload } from "@/types/diagnosis";

/**
 * Senior-level Visit Service
 * Handles patient visits and diagnostic records
 */
export const VisitService = {
  getAllVisits: (page: number = 1, size: number = 10) => 
    api.get<PageResponse<Visit>>(`/visits?page=${page}&size=${size}`),

  getPatientVisits: (patientId: string) => 
    api.get<Visit[]>(`/patients/${patientId}/visits`),

  createVisit: (payload: CreateVisitPayload) => 
    api.post<Visit>("/visits", payload),

  updateVisit: (id: string, payload: Partial<CreateVisitPayload>) => 
    api.put<Visit>(`/visits/${id}`, payload),

  deleteVisit: (id: string) => 
    api.delete<boolean>(`/visits/${id}`),

  createMultimodalVisit: (payload: {
    patientId: string;
    symptoms: string;
    note?: string;
    imageUrl: string;
    imageType: string;
    result: string;
    confidenceScore: number;
    modelVersion: string;
  }) => api.post<Visit>("/visits/multimodal", payload),

  getVisitById: (id: string) => 
    api.get<Visit>(`/visits/${id}`),
};
