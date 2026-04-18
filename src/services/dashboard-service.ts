import { api } from "./api-client";
import { 
  Visit, 
  DashboardSummary, 
  VisitTrend, 
  DiagnosisStat 
} from "@/types";

export const DashboardService = {
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
    return await api.get<Visit[]>(`/dashboard/recent-visits?limit=${limit}`);
  },
};
