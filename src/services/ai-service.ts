import { aiApi } from "@/lib/api";
import {
    PneumoniaPredictionResponse,
    ClinicalDiagnosisRequest,
    ClinicalDiagnosisResponse,
    FusionPredictionRequest,
    FusionPredictionResponse,
    MultimodalPredictionResponse,
    DiagnoseResponse,
    AIHealthStatus
} from "@/types/diagnosis";

export const AiService = {
    /**
     * Send image to AI model for pneumonia prediction
     * @param file The image file to analyze
     * @returns Prediction results
     */
    async predictPneumonia(file: File): Promise<PneumoniaPredictionResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await aiApi.post<PneumoniaPredictionResponse>("/pneumonia/predict", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
        });

        return response.data;
    },

    /**
     * Send clinical data to AI model for diagnosis
     * @param data The clinical data
     * @returns Prediction results
     */
    async predictClinical(data: ClinicalDiagnosisRequest): Promise<ClinicalDiagnosisResponse> {
        const response = await aiApi.post<ClinicalDiagnosisResponse>("/clinical/predict", data);
        return response.data;
    },

    /**
     * Send combined data to AI model for fusion diagnosis
     * @param data The combined image and clinical results
     * @returns Fusion prediction results
     */
    async predictFusion(data: FusionPredictionRequest): Promise<FusionPredictionResponse> {
        const response = await aiApi.post<FusionPredictionResponse>("/fusion/predict", data);
        return response.data;
    },

    /**
     * Send both image and symptoms to AI model for multimodal diagnosis
     * @param file The image file to analyze
     * @param symptoms Comma-separated symptoms string
     * @returns Consolidated prediction results including risk level and heatmap
     */
    async predictMultimodal(file: File, symptoms: string, curb65Score?: number): Promise<MultimodalPredictionResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("symptoms", symptoms);
        if (curb65Score !== undefined && curb65Score !== null) {
            formData.append("curb65_score", curb65Score.toString());
        }

        const response = await aiApi.post<MultimodalPredictionResponse>("/report/predict", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 60000, // Analysis might take longer
        });

        return response.data;
    },

    /**
     * Send X-ray and symptoms to the new multimodal diagnose API
     * @param patientId Patient ID
     * @param file The X-ray file
     * @param symptoms Array of symptom string codes
     * @returns Consolidated prediction details matching the API contract
     */
    async predictDiagnose(patientId: string, file: File, symptoms: string[]): Promise<DiagnoseResponse> {
        const formData = new FormData();
        formData.append("patient_id", patientId);
        formData.append("xray_image", file);
        symptoms.forEach(sym => {
            formData.append("symptoms", sym);
        });

        const response = await aiApi.post<DiagnoseResponse>("/diagnose", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 60000,
        });

        return response.data;
    },

    /**
     * Get list of symptoms supported by the AI model
     * @returns Array of symptom strings
     */
    async getSymptoms(): Promise<string[]> {
        const response = await aiApi.get<string[]>("/symptoms");
        return response.data;
    },

    /**
     * Get normalised feature importance weights from the clinical LR model's coef_
     * @returns Map of symptom code → weight (0-1, sum=1)
     */
    async getSymptomWeights(): Promise<Record<string, number>> {
        const response = await aiApi.get<Record<string, number>>("/symptoms/weights");
        return response.data;
    },

    /**
     * Check AI system health and model loading status
     * @returns Health status object
     */
    async getHealth(): Promise<AIHealthStatus> {
        const response = await aiApi.get<AIHealthStatus>("/health");
        return response.data;
    },
};
