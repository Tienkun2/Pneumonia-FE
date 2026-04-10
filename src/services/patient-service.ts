import { api } from "@/services/api-client";
import { PageResponse } from "@/types/api";
import { Patient, CreatePatientPayload } from "@/types/patient";

/**
 * Senior-level Patient Service
 * Professional API integration for clinical domain
 */
export const PatientService = {
  getPatients: (page: number = 1, size: number = 10, filters?: Record<string, string | number | boolean | string[] | undefined>) => {
    let query = `/patients?page=${page}&size=${size}`;
    if (filters?.search) query += `&search=${encodeURIComponent(String(filters.search))}`;
    if (filters?.gender) query += `&gender=${encodeURIComponent(String(filters.gender))}`;
    if (filters?.startDate) query += `&startDate=${encodeURIComponent(String(filters.startDate))}`;
    if (filters?.endDate) query += `&endDate=${encodeURIComponent(String(filters.endDate))}`;

    return api.get<PageResponse<Patient>>(query);
  },

  getPatientById: (id: string) => api.get<Patient>(`/patients/${id}`),

  createPatient: (payload: CreatePatientPayload) => api.post<Patient>("/patients", payload),

  updatePatient: (id: string, payload: Partial<CreatePatientPayload>) => 
    api.put<Patient>(`/patients/${id}`, payload),

  deletePatient: (id: string) => api.delete<unknown>(`/patients/${id}`),
};
