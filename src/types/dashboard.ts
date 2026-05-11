export interface DashboardSummary {
  totalPatients: number;
  totalVisits: number;
  totalUsers: number;
  todayVisits: number;
  percentageIncrease: number;
}

export interface VisitTrend {
  date: string;
  visits: number;
}

export interface DiagnosisStat {
  label: string;
  count: number;
  color?: string;
}

// Dùng lại shape của Visit để tránh circular import
export interface DashboardRecentVisit {
  id: string;
  patientId: string;
  patientName?: string;
  visitDate: string;
  diagnosisResult?: string;
  symptoms?: string;
  note?: string;
  createdBy?: string;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  trends: VisitTrend[];
  diagnosisStats: DiagnosisStat[];
  recentVisits: DashboardRecentVisit[];
}
