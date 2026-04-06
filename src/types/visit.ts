export interface MedicalImage {
  id: string;
  imageUrl: string;
  type: string;
  uploadedAt: string;
}

export interface Diagnosis {
  id: string;
  result: string;
  confidenceScore: number;
  modelVersion: string;
  doctorConfirm: boolean;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  symptoms?: string;
  note?: string;
  createdBy: string;
  medicalImages: MedicalImage[];
  diagnoses: Diagnosis[];
}

export interface CreateVisitPayload {
  patientId: string;
  symptoms?: string;
  note?: string;
}
