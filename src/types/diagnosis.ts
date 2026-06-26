export interface MedicalImage {
  id: string;
  imageUrl: string;
  imageType: string;
}

export interface Diagnosis {
  id: string;
  result: string;
  confidenceScore: number;
  modelVersion?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName?: string;
  symptoms: string;
  note?: string;
  createdAt: string;
  visitDate: string;
  createdBy?: string;
  diagnosisResult?: string;
  confidenceScore?: number;
  status: string;
  medicalImages?: MedicalImage[];
  diagnoses?: Diagnosis[];
}

export interface CreateVisitPayload {
  patientId: string;
  symptoms: string;
  note?: string;
}

export interface PneumoniaPredictionResponse {
  message: string;
  confidence_score: number;
  probability_pneumonia: number;
  prediction: string;
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

export interface MultimodalPredictionResponse {
  vision_probability: number;
  clinical_probability: number;
  final_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  heatmap: string;
  selected_symptoms: string[];
  clinical_alerts: string[];
  applied_vision_weight: number;
  applied_clinical_weight: number;
  curb65_score?: number;
  gradcam_error?: string;
  master_prompt?: string;
  llm_report?: string;
  llm_fallback?: boolean;
  location_label?: string;
  distribution_label?: string;
  characteristic_label?: string;
  attention_in_lung_pct?: number;
  hot_area_pct?: number;
  description?: string;
  decision?: "positive" | "negative";
  decision_label?: string;
  threshold?: number;
}

export interface DiagnoseResponse {
  patient_id: string;
  xray: {
    p_img: number;
    gradcam_overlay?: string;
    lung_focus_ratio?: number;
    location_label?: string;
    distribution_label?: string;
    characteristic_label?: string;
    attention_in_lung_pct?: number;
    hot_area_pct?: number;
    description?: string;
  };
  symptom: {
    p_sym: number;
    active_symptoms: string[];
  };
  fusion: {
    nudge_logodds: number;
    p_fused: number;
    threshold: number;
    decision: "positive" | "negative";
    decision_label: string;
  };
  model_versions: {
    xray: string;
    seg: string;
    symptom: string;
    fusion: string;
  };
  timestamp: string;
}

export interface AIHealthStatus {
  status: string;
  model_loaded: boolean;
  device: string;
}

export interface DiagnosisFormData {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: "male" | "female" | "other";
  symptoms: {
    cough: boolean;
    fever: boolean;
    shortnessOfBreath: boolean;
    chestPain: boolean;
    fatigue: boolean;
    other?: string;
  };
  vitals: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    oxygenSaturation?: number;
  };
  labTests: {
    wbc?: number;
    crp?: number;
    procalcitonin?: number;
    other?: string;
  };
  imagePreview?: string;

  currentStep: number;
  predictionResult?: PneumoniaPredictionResponse | null;

  clinicalData: {
    age_months: number;
    chest_indrawing: boolean;
    cough: boolean;
    danger_sign: boolean;
    feeding_difficulty: boolean;
    fever: boolean;
    respiratory_rate: number;
    spO2: number;
  };
  clinicalPredictionResult?: ClinicalDiagnosisResponse | null;
  fusionResult?: FusionPredictionResponse | null;
  multimodalResult?: MultimodalPredictionResponse | null;
}

export interface VisitState {
  visits: Visit[];
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
