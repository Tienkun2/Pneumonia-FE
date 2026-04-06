import { aiApi } from "@/lib/api";
import {
    PneumoniaPredictionResponse,
    ClinicalDiagnosisRequest,
    ClinicalDiagnosisResponse,
    FusionPredictionRequest,
    FusionPredictionResponse,
    MultimodalPredictionResponse,
    AIHealthStatus
} from "@/types";

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
    async predictMultimodal(file: File, symptoms: string): Promise<MultimodalPredictionResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("symptoms", symptoms);

        const response = await aiApi.post<MultimodalPredictionResponse>("/predict", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 60000, // Analysis might take longer
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
     * Check AI system health and model loading status
     * @returns Health status object
     */
    async getHealth(): Promise<AIHealthStatus> {
        const response = await aiApi.get<AIHealthStatus>("/health");
        return response.data;
    },
};
