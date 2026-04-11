export interface Patient {
  id: string;
  code: string;
  fullName: string;
  dateOfBirth?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  guardianName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreatePatientPayload {
  code: string;
  fullName: string;
  dateOfBirth?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  guardianName?: string;
  phone?: string;
  address?: string;
}

export interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
