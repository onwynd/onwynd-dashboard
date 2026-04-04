import { create } from "zustand";
import { complianceService } from "@/lib/api/compliance";

export type LayoutDensity = "default" | "compact" | "comfortable";

export interface StatCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  subtitleIcon: string;
}

export interface ComplianceIssue {
  id: string;
  title: string;
  type: "HIPAA" | "GDPR" | "Internal" | "SOC2";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  dueDate: string;
}

export interface AuditData {
  name: string;
  value: number;
  color: string;
}

interface DashboardState {
  stats: StatCard[];
  issues: ComplianceIssue[];
  auditData: AuditData[];
  searchQuery: string;
  severityFilter: string;
  statusFilter: string;
  layoutDensity: LayoutDensity;
  
  setSearchQuery: (query: string) => void;
  setSeverityFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setLayoutDensity: (density: LayoutDensity) => void;
  
  // UI Toggles
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchIssues: (params?: Record<string, unknown>) => Promise<void>;
  fetchAuditData: (period?: string) => Promise<void>;
}

export const useComplianceStore = create<DashboardState>((set) => ({
  stats: [],
  issues: [],
  auditData: [],
  searchQuery: "",
  severityFilter: "all",
  statusFilter: "all",
  layoutDensity: "default",
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSeverityFilter: (filter) => set({ severityFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),

  fetchStats: async () => {
    try {
      const data = await complianceService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch compliance stats:", error);
    }
  },

  fetchIssues: async (params) => {
    try {
      const data = await complianceService.getIssues(params);
      set({ issues: data });
    } catch (error) {
      console.error("Failed to fetch compliance issues:", error);
    }
  },

  fetchAuditData: async (period = "monthly") => {
    try {
      const data = await complianceService.getAuditData(period);
      set({ auditData: data });
    } catch (error) {
      console.error("Failed to fetch audit data:", error);
    }
  },
}));
