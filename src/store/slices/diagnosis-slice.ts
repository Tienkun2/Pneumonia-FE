import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { 
  PneumoniaPredictionResponse, 
  ClinicalDiagnosisResponse, 
  FusionPredictionResponse, 
  MultimodalPredictionResponse,
  DiagnosisFormData
} from "@/types/diagnosis";

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
  multimodalResult: null,
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
    setMultimodalResult: (state, action: PayloadAction<MultimodalPredictionResponse | null>) => {
      state.multimodalResult = action.payload;
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
  setMultimodalResult,
  resetForm,
} = diagnosisSlice.actions;

export default diagnosisSlice.reducer;
