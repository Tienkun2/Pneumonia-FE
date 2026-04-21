export const RESULT_COLUMN_LABELS = {
  patientCode: "Mã BN",
  patientName: "Họ tên bệnh nhân",
  visitDate: "Ngày khám",
  riskLevel: "Mức độ nguy cơ",
  status: "Trạng thái",
};

export const RISK_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    ring: string;
  }
> = {
  Cao: {
    label: "Nguy cơ cao",
    color: "text-red-500",
    bg: "bg-red-500/8 dark:bg-red-500/5",
    border: "border-red-500/20",
    dot: "bg-red-500",
    ring: "#ef4444",
  },
  "Trung bình": {
    label: "Nguy cơ trung bình",
    color: "text-amber-500",
    bg: "bg-amber-500/8 dark:bg-amber-500/5",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    ring: "#f59e0b",
  },
  Thấp: {
    label: "Nguy cơ thấp",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/5",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    ring: "#10b981",
  },
};
