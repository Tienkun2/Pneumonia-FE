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
