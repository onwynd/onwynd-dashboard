import { create } from "zustand";
import { salesService } from "@/lib/api/sales";

export interface SalesLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  value?: number;
  created_at: string;
}

export interface SalesTask {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  lead_id?: number;
  deal_id?: number;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: "dollar-sign" | "briefcase" | "trending-up" | "percent";
}

export interface Deal {
  id: string;
  dealName: string;
  client: string;
  stage: string;
  value: number;
  owner: string;
  closeDate: string;
  dealColor?: string;
  dealInitial?: string;
  ownerInitials?: string;
}

export interface RevenueFlow {
  name: string;
  thisYear: number;
  lastYear: number;
}

export interface LeadSource {
  name: string;
  value: number;
  color?: string;
}

interface SalesState {
  stats: StatCard[];
  deals: Deal[];
  revenueFlow: RevenueFlow[];
  leadSources: LeadSource[];
  leads: SalesLead[];
  tasks: SalesTask[];
  layoutDensity: "compact" | "default" | "comfortable";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  searchQuery: string;
  stageFilter: string;
  ownerFilter: string;
  valueFilter: string;
  setLayoutDensity: (density: "compact" | "default" | "comfortable") => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setStageFilter: (filter: string) => void;
  setOwnerFilter: (filter: string) => void;
  setValueFilter: (filter: string) => void;
  clearFilters: () => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchRevenueFlow: (period: string) => Promise<void>;
  fetchLeadSources: (period: string) => Promise<void>;
  fetchDeals: (params?: Record<string, unknown>) => Promise<void>;
  fetchLeads: (params?: Record<string, unknown>) => Promise<void>;
  fetchTasks: (params?: Record<string, unknown>) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set) => ({
  stats: [],
  deals: [],
  revenueFlow: [],
  leadSources: [],
  leads: [],
  tasks: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  searchQuery: "",
  stageFilter: "all",
  ownerFilter: "all",
  valueFilter: "all",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStageFilter: (filter) => set({ stageFilter: filter }),
  setOwnerFilter: (filter) => set({ ownerFilter: filter }),
  setValueFilter: (filter) => set({ valueFilter: filter }),
  clearFilters: () =>
    set({
      searchQuery: "",
      stageFilter: "all",
      ownerFilter: "all",
      valueFilter: "all",
    }),

  fetchStats: async () => {
    try {
      const data = await salesService.getStats();
      set({ stats: data as StatCard[] || undefined });
    } catch (error) {
      console.error("Failed to fetch sales stats:", error);
    }
  },

  fetchRevenueFlow: async (period) => {
    try {
      const data = await salesService.getRevenueFlow(period);
      set({ revenueFlow: data as RevenueFlow[] || undefined });
    } catch (error) {
      console.error("Failed to fetch revenue flow:", error);
    }
  },

  fetchLeadSources: async (period) => {
    try {
      const data = await salesService.getLeadSources(period);
      set({ leadSources: data as LeadSource[] || undefined });
    } catch (error) {
      console.error("Failed to fetch lead sources:", error);
    }
  },

  fetchDeals: async (params) => {
    try {
      const data = await salesService.getDeals(params);
      set({ deals: data as Deal[] || undefined });
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    }
  },

  fetchLeads: async (params) => {
    try {
      const data = await salesService.getLeads(params);
      set({ leads: data });
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  },

  fetchTasks: async (params) => {
    try {
      const data = await salesService.getTasks(params);
      set({ tasks: data });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  },
}));
