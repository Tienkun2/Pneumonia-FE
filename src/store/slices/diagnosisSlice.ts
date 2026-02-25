import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PneumoniaPredictionResponse, ClinicalDiagnosisResponse, FusionPredictionResponse } from "@/types";

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
}

const initialState: DiagnosisFormData = {
  symptoms: {
    cough: false,
    fever: false,
    shortnessOfBreath: false,
    chestPain: false,
    fatigue: false,
  },
  vitals: {},
  labTests: {},

  currentStep: 1,
  predictionResult: null,

  clinicalData: {
    age_months: 12,
    chest_indrawing: false,
    cough: false,
    danger_sign: false,
    feeding_difficulty: false,
    fever: false,
    respiratory_rate: 30,
    spO2: 98,
  },
  clinicalPredictionResult: null,
  fusionResult: null,
};

const diagnosisSlice = createSlice({
  name: "diagnosis",
  initialState,
  reducers: {
    setPatientInfo: (
      state,
      action: PayloadAction<{
        patientId?: string;
        patientName?: string;
        patientAge?: number;
        patientGender?: "male" | "female" | "other";
      }>
    ) => {
      state.patientId = action.payload.patientId;
      state.patientName = action.payload.patientName;
      state.patientAge = action.payload.patientAge;
      state.patientGender = action.payload.patientGender;
    },
    setSymptoms: (state, action: PayloadAction<DiagnosisFormData["symptoms"]>) => {
      state.symptoms = action.payload;
    },
    setVitals: (state, action: PayloadAction<DiagnosisFormData["vitals"]>) => {
      state.vitals = action.payload;
    },
    setLabTests: (state, action: PayloadAction<DiagnosisFormData["labTests"]>) => {
      state.labTests = action.payload;
    },
    setImagePreview: (state, action: PayloadAction<string | undefined>) => {
      state.imagePreview = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setPredictionResult: (state, action: PayloadAction<PneumoniaPredictionResponse | null>) => {
      state.predictionResult = action.payload;
    },
    setClinicalData: (state, action: PayloadAction<DiagnosisFormData["clinicalData"]>) => {
      state.clinicalData = action.payload;
    },
    setClinicalPredictionResult: (state, action: PayloadAction<ClinicalDiagnosisResponse | null>) => {
      state.clinicalPredictionResult = action.payload;
    },
    setFusionResult: (state, action: PayloadAction<FusionPredictionResponse | null>) => {
      state.fusionResult = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const {
  setPatientInfo,
  setSymptoms,
  setVitals,
  setLabTests,
  setImagePreview,

  setCurrentStep,
  setPredictionResult,
  setClinicalData,
  setClinicalPredictionResult,
  setFusionResult,
  resetForm,
} = diagnosisSlice.actions;

export default diagnosisSlice.reducer;
