export interface Diagnosis {
  id: string;
  visitId: string;
  result: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  symptoms?: string;
  note?: string;
  createdBy: string;
  medicalImages: unknown[] | null;
  diagnoses: Diagnosis[] | null;
}

export interface CreateVisitPayload {
  patientId: string;
  symptoms?: string;
  note?: string;
}
