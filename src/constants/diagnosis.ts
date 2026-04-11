import { Visit } from "@/types/diagnosis";

export const RISKS_MAP: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  LOW: { 
    label: "Nguy cơ thấp", 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/5", 
    dot: "bg-emerald-500", 
    border: "border-emerald-500/20" 
  },
  MEDIUM: { 
    label: "Nguy cơ trung bình", 
    color: "text-amber-500", 
    bg: "bg-amber-500/10 dark:bg-amber-500/5", 
    dot: "bg-amber-500", 
    border: "border-amber-500/20" 
  },
  HIGH: { 
    label: "Nguy cơ cao", 
    color: "text-red-500", 
    bg: "bg-red-500/10 dark:bg-red-500/5", 
    dot: "bg-red-500", 
    border: "border-red-500/20" 
  },
  Unknown: { 
    label: "Chưa xác định", 
    color: "text-slate-500", 
    bg: "bg-slate-500/10", 
    dot: "bg-slate-400", 
    border: "border-slate-500/20" 
  },
};

export const SYMPTOM_LABELS: Record<string, string> = {
  chills: "Rét run",
  fatigue: "Mệt mỏi",
  cough: "Ho",
  high_fever: "Sốt cao",
  breathlessness: "Khó thở",
  phlegm: "Đờm",
  chest_pain: "Đau ngực",
  fast_heart_rate: "Nhịp tim nhanh",
  rusty_sputum: "Đờm màu gỉ sắt",
  malaise: "Uể oải",
};
export const getVisitRisk = (visit: Visit | undefined) => {
  const diag = visit?.diagnoses?.[0];
  if (!diag) return 0;
  return diag.confidenceScore * 100;
};

export const getRiskLabel = (risk: number) => risk > 70 ? "Cao" : risk > 40 ? "Trung bình" : "Thấp";
export const getRiskColor = (risk: number) => risk > 70 ? "text-red-500" : risk > 40 ? "text-amber-500" : "text-emerald-500";
export const getRiskBg = (risk: number) => risk > 70 ? "bg-red-500/10" : risk > 40 ? "bg-amber-500/10" : "bg-emerald-500/10";

export const getBarColor = (score: number) => {
  if (score > 0.7) return "bg-red-500";
  if (score > 0.4) return "bg-amber-500";
  return "bg-blue-600";
};
