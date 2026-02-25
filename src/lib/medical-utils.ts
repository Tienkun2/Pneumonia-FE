/**
 * Medical utility functions for validation and formatting
 */

export interface VitalRanges {
  temperature: { min: number; max: number };
  heartRate: { min: number; max: number };
  systolicBP: { min: number; max: number };
  diastolicBP: { min: number; max: number };
  oxygenSaturation: { min: number; max: number };
}

export const NORMAL_VITAL_RANGES: VitalRanges = {
  temperature: { min: 36.5, max: 37.5 },
  heartRate: { min: 60, max: 100 },
  systolicBP: { min: 90, max: 140 },
  diastolicBP: { min: 60, max: 90 },
  oxygenSaturation: { min: 95, max: 100 },
};

export function validateTemperature(temp: number): {
  valid: boolean;
  status: "normal" | "warning" | "critical";
  message?: string;
} {
  if (temp < 35) {
    return {
      valid: false,
      status: "critical",
      message: "Nhiệt độ quá thấp - cần can thiệp ngay",
    };
  }
  if (temp > 40) {
    return {
      valid: false,
      status: "critical",
      message: "Sốt cao - cần can thiệp ngay",
    };
  }
  if (
    temp < NORMAL_VITAL_RANGES.temperature.min ||
    temp > NORMAL_VITAL_RANGES.temperature.max
  ) {
    return {
      valid: true,
      status: "warning",
      message: "Nhiệt độ ngoài phạm vi bình thường",
    };
  }
  return { valid: true, status: "normal" };
}

export function validateHeartRate(hr: number): {
  valid: boolean;
  status: "normal" | "warning" | "critical";
  message?: string;
} {
  if (hr < 40) {
    return {
      valid: false,
      status: "critical",
      message: "Nhịp tim quá chậm - cần can thiệp ngay",
    };
  }
  if (hr > 150) {
    return {
      valid: false,
      status: "critical",
      message: "Nhịp tim quá nhanh - cần can thiệp ngay",
    };
  }
  if (
    hr < NORMAL_VITAL_RANGES.heartRate.min ||
    hr > NORMAL_VITAL_RANGES.heartRate.max
  ) {
    return {
      valid: true,
      status: "warning",
      message: "Nhịp tim ngoài phạm vi bình thường",
    };
  }
  return { valid: true, status: "normal" };
}

export function validateOxygenSaturation(spo2: number): {
  valid: boolean;
  status: "normal" | "warning" | "critical";
  message?: string;
} {
  if (spo2 < 90) {
    return {
      valid: false,
      status: "critical",
      message: "SpO2 thấp - cần can thiệp ngay",
    };
  }
  if (spo2 < NORMAL_VITAL_RANGES.oxygenSaturation.min) {
    return {
      valid: true,
      status: "warning",
      message: "SpO2 dưới mức bình thường",
    };
  }
  return { valid: true, status: "normal" };
}

export function parseBloodPressure(bp: string): {
  systolic: number;
  diastolic: number;
  valid: boolean;
} {
  const match = bp.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return { systolic: 0, diastolic: 0, valid: false };
  }
  return {
    systolic: parseInt(match[1], 10),
    diastolic: parseInt(match[2], 10),
    valid: true,
  };
}

export function validateBloodPressure(bp: string): {
  valid: boolean;
  status: "normal" | "warning" | "critical";
  message?: string;
} {
  const parsed = parseBloodPressure(bp);
  if (!parsed.valid) {
    return {
      valid: false,
      status: "warning",
      message: "Định dạng huyết áp không hợp lệ (VD: 120/80)",
    };
  }

  const { systolic, diastolic } = parsed;

  // Hypertensive crisis
  if (systolic > 180 || diastolic > 120) {
    return {
      valid: true,
      status: "critical",
      message: "Huyết áp rất cao - cần can thiệp ngay",
    };
  }

  // Hypertension
  if (
    systolic > NORMAL_VITAL_RANGES.systolicBP.max ||
    diastolic > NORMAL_VITAL_RANGES.diastolicBP.max
  ) {
    return {
      valid: true,
      status: "warning",
      message: "Huyết áp cao",
    };
  }

  // Hypotension
  if (
    systolic < NORMAL_VITAL_RANGES.systolicBP.min ||
    diastolic < NORMAL_VITAL_RANGES.diastolicBP.min
  ) {
    return {
      valid: true,
      status: "warning",
      message: "Huyết áp thấp",
    };
  }

  return { valid: true, status: "normal" };
}

export function calculateRiskLevel(score: number): "Cao" | "Trung bình" | "Thấp" {
  if (score >= 70) return "Cao";
  if (score >= 40) return "Trung bình";
  return "Thấp";
}

export function formatMedicalValue(
  value: number | string | undefined,
  unit: string
): string {
  if (value === undefined || value === null) return "-";
  return `${value} ${unit}`;
}
