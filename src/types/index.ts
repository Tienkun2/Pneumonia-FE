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

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
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



export interface PneumoniaPredictionResponse {
  filename: string;
  imaging_assessment: string;
  probability_score: number;
  confidence_level: string;
  explanation_en: string;
  explanation_vi: string;
  disclaimer_en: string;
  disclaimer_vi: string;
}

export interface ClinicalDiagnosisRequest {
  age_months: number;
  chest_indrawing: boolean;
  cough: boolean;
  danger_sign: boolean;
  feeding_difficulty: boolean;
  fever: boolean;
  respiratory_rate: number;
  spO2: number;
}

export interface ClinicalDiagnosisResponse {
  clinical_classification: string;
  severity_level: string;
  probability_distribution: {
    Low: number;
    Moderate: number;
    Severe: number;
  };
  reasoning_en: string;
  reasoning_vi: string;
  guidance_en: string;
  guidance_vi: string;
  disclaimer_en: string;
  disclaimer_vi: string;
}

export interface FusionPredictionRequest {
  xray_result: PneumoniaPredictionResponse;
  clinical_result: ClinicalDiagnosisResponse;
}

export interface FusionPredictionResponse {
  condition_assessment: string;
  severity_level: string;
  confidence_level: string;
  fusion_reasoning: string[];
  recommendation_en: string;
  recommendation_vi: string;
  disclaimer_en: string;
  disclaimer_vi: string;
}
