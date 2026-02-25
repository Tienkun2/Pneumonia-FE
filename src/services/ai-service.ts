import { aiApi } from "@/lib/api";
import {
    PneumoniaPredictionResponse,
    ClinicalDiagnosisRequest,
    ClinicalDiagnosisResponse,
    FusionPredictionRequest,
    FusionPredictionResponse
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

        const response = await aiApi.post<PneumoniaPredictionResponse>("/api/v1/pneumonia/predict", formData, {
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
        const response = await aiApi.post<ClinicalDiagnosisResponse>("/api/v1/clinical/predict", data);
        return response.data;
    },

    /**
     * Send combined data to AI model for fusion diagnosis
     * @param data The combined image and clinical results
     * @returns Fusion prediction results
     */
    async predictFusion(data: FusionPredictionRequest): Promise<FusionPredictionResponse> {
        const response = await aiApi.post<FusionPredictionResponse>("/api/v1/fusion/predict", data);
        return response.data;
    },
};
