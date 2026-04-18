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
