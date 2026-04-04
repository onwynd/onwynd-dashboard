import { create } from "zustand";
import { partnerService } from "@/lib/api/partner";

export interface PartnerStat {
  title: string;
  value: string;
  subtitle: string;
  iconName?: string;
}

export interface Employee {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  department?: string;
  job_title?: string;
  created_at: string;
  profile_photo: string | null;
  status?: string; // For UI compatibility if needed, otherwise derive from is_active
}



export interface FinancialFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange: number;
  moneyOutChange: number;
}

interface PartnerState {
  stats: PartnerStat[];
  employees: Employee[];
  financialFlow: FinancialFlowData[];
  layoutDensity: "compact" | "default" | "comfortable";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  setLayoutDensity: (density: "compact" | "default" | "comfortable") => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  clearFilters: () => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchEmployees: (params?: Record<string, unknown>) => Promise<void>;
  fetchFinancialFlow: (period: string) => Promise<void>;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  stats: [],
  employees: [],
  financialFlow: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (filter) => set({ departmentFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearFilters: () => set({ searchQuery: "", departmentFilter: "all", statusFilter: "all" }),

  fetchStats: async () => {
    try {
      const data = await partnerService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch partner stats:", error);
    }
  },

  fetchEmployees: async (params) => {
    try {
      const data = await partnerService.getEmployees(params);
      set({ employees: data });
    } catch (error) {
      console.error("Failed to fetch partner employees:", error);
    }
  },

  fetchFinancialFlow: async (period) => {
    try {
      const data = await partnerService.getFinancialFlow(period);
      set({ financialFlow: data });
    } catch (error) {
      console.error("Failed to fetch partner financial flow:", error);
    }
  },
}));
