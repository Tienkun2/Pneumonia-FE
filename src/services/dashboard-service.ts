import { api } from "./api-client";
import { 
  DashboardSummary,
  DashboardOverview,
  VisitTrend, 
  DiagnosisStat,
  DashboardRecentVisit,
} from "@/types";

export const DashboardService = {
  getOverview: async () => {
    return await api.get<DashboardOverview>("/dashboard/overview");
  },

  getSummary: async () => {
    return await api.get<DashboardSummary>("/dashboard/summary");
  },

  getVisitTrends: async (range: string = "7d") => {
    return await api.get<VisitTrend[]>(`/dashboard/visits-chart?range=${range}`);
  },

  getDiagnosisStats: async () => {
    return await api.get<DiagnosisStat[]>("/dashboard/diagnosis-stats");
  },

  getRecentVisits: async (limit: number = 5) => {
    return await api.get<DashboardRecentVisit[]>(`/dashboard/recent-visits?limit=${limit}`);
  },
};
