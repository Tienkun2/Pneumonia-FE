export const DIAGNOSIS_MAP: Record<string, string> = {
  "NORMAL": "Bình thường",
  "PNEUMONIA": "Viêm phổi",
  "UNKNOWN": "Không xác định"
};

export const getDiagnosisTranslation = (key: string) => DIAGNOSIS_MAP[key] || key;
