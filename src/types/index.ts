/**
 * Global application types
 * Domain-specific types should reside within their respective feature folders.
 */

export interface DiagnosisResult {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  imageRisk: number;
  clinicalRisk: number;
  overallRisk: number;
  riskLevel: "Cao" | "Trung bình" | "Thấp";
  findings: string;
  recommendations: string[];
  imageUrl?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content?: string;
  date: string;
  tags: string[];
}

export * from "./api";
export * from "./auth";
export * from "./diagnosis";
export * from "./menu";
export * from "./patient";
export * from "./permission";
export * from "./role";
export * from "./user";

