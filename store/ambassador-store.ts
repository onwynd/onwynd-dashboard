import { create } from "zustand";
import { ambassadorService } from "@/lib/api/ambassador";

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: "Users" | "DollarSign" | "TrendingUp" | "Award";
}

interface Referral {
  id: number;
  name: string;
  email: string;
  date: string;
  status: string;
  plan: string;
  earnings: string;
  avatar: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: "active" | "offline" | "away";
  avatar: string;
  tags: string[];
  address: string;
}

interface AmbassadorState {
  stats: StatCard[];
  referrals: Referral[];
  people: Person[];
  chartData: { month: string; referrals: number; earnings: number }[];
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  layoutDensity: "compact" | "comfortable" | "spacious";
  
  // Actions
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  setLayoutDensity: (density: "compact" | "comfortable" | "spacious") => void;
  
  // API Actions
  fetchStats: () => Promise<void>;
  fetchReferrals: (params?: Record<string, unknown>) => Promise<void>;
  fetchPeople: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
}

export const useAmbassadorStore = create<AmbassadorState>((set) => ({
  stats: [],
  referrals: [],
  people: [],
  chartData: [],
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  layoutDensity: "comfortable",

  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  setLayoutDensity: (density) => set({ layoutDensity: density }),

  fetchStats: async () => {
    try {
      const data = await ambassadorService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch ambassador stats:", error);
    }
  },

  fetchReferrals: async (params) => {
    try {
      const data = await ambassadorService.getReferrals(params);
      set({ referrals: data });
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    }
  },

  fetchPeople: async (params) => {
    try {
      const data = await ambassadorService.getPeople(params);
      set({ people: data });
    } catch (error) {
      console.error("Failed to fetch people:", error);
    }
  },

  fetchChartData: async (period) => {
    try {
      const data = await ambassadorService.getPerformance(period);
      set({ chartData: data });
    } catch (error) {
      console.error("Failed to fetch ambassador chart data:", error);
    }
  },
}));
