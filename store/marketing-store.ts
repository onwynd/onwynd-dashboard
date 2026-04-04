import { create } from "zustand";
import { marketingService } from "@/lib/api/marketing";
import { parseApiResponse } from "@/lib/api/utils";

export interface Campaign {
  id: number;
  name: string;
  type: string;
  status: "active" | "paused" | "completed" | "draft";
  budget: number;
  start_date: string;
  end_date: string | null;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  status: "new" | "contacted" | "qualified" | "lost";
  source: string | null;
  assigned_to: number | null;
  created_at: string;
}

export interface MarketingStat {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  iconName: string;
  description: string;
}

export interface MarketingChartData {
  date: string;
  facebook: number;
  google: number;
  linkedin: number;
}

export interface LeadSource {
  name: string;
  value: number;
  color: string;
}

interface MarketingState {
  stats: MarketingStat[];
  campaigns: Campaign[];
  leads: Lead[];
  chartData: MarketingChartData[];
  leadSources: LeadSource[];
  layoutDensity: "default" | "comfortable" | "compact";
  dateRange: string;
  platformFilter: string;
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  setLayoutDensity: (density: "default" | "comfortable" | "compact") => void;
  setDateRange: (range: string) => void;
  setPlatformFilter: (filter: string) => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchCampaigns: (params?: Record<string, unknown>) => Promise<void>;
  fetchLeads: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
  fetchLeadSources: (period: string) => Promise<void>;
}

const initialStats: MarketingStat[] = [];

export const useMarketingStore = create<MarketingState>((set) => ({
  stats: initialStats,
  campaigns: [],
  leads: [],
  chartData: [],
  leadSources: [],
  layoutDensity: "default",
  dateRange: "Last 7 days",
  platformFilter: "all",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setDateRange: (range) => set({ dateRange: range }),
  setPlatformFilter: (filter) => set({ platformFilter: filter }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),

  fetchStats: async () => {
    try {
      const response = await marketingService.getStats();
      const data = parseApiResponse(response);
      set({ stats: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch marketing stats:", error);
      set({ stats: [] });
    }
  },

  fetchCampaigns: async (params) => {
    try {
      const response = await marketingService.getCampaigns(params);
      const campaigns = parseApiResponse(response);
      set({ campaigns: Array.isArray(campaigns) ? campaigns : [] });
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      set({ campaigns: [] });
    }
  },

  fetchLeads: async (params) => {
    try {
      const response = await marketingService.getLeads(params);
      const leads = parseApiResponse(response);
      set({ leads: Array.isArray(leads) ? leads : [] });
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      set({ leads: [] });
    }
  },

  fetchChartData: async (period) => {
    try {
      const response = await marketingService.getChartData(period);
      const data = parseApiResponse(response);
      set({ chartData: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch marketing chart data:", error);
      set({ chartData: [] });
    }
  },

  fetchLeadSources: async (period) => {
    try {
      const response = await marketingService.getLeadSources(period);
      const data = parseApiResponse(response);
      set({ leadSources: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch lead sources:", error);
      set({ leadSources: [] });
    }
  },
}));
