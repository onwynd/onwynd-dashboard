import { create } from "zustand";
import { healthService } from "@/lib/api/health";

export interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: string;
}

export interface CheckIn {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "in-session" | "waiting" | "completed" | "cancelled";
  checkInTime: string;
  appointmentTime: string;
  doctorName: string;
  reason: string;
}

export interface Document {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  uploadedAt: string;
  size: string;
  icon: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

// Default stat cards shown before the API responds
const defaultStats: StatCard[] = [
  { id: "checkins-today",    title: "My Check-ins Today",    value: "—", icon: "check-circle" },
  { id: "reports-submitted", title: "Reports Submitted",     value: "—", icon: "clipboard"    },
  { id: "pending-reports",   title: "Pending Reports",       value: "—", icon: "calendar"     },
  { id: "active-distress",   title: "Active Distress Cases", value: "—", icon: "activity"     },
];

interface HealthState {
  stats: StatCard[];
  checkIns: CheckIn[];
  documents: Document[];
  chartData: ChartDataPoint[];
  weeklyChartData: ChartDataPoint[];
  searchQuery: string;

  setSearchQuery: (query: string) => void;

  // API actions
  fetchStats: () => Promise<void>;
  fetchCheckIns: (params?: Record<string, unknown>) => Promise<void>;
  fetchDocuments: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: () => Promise<void>;
  fetchWeeklyChartData: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set) => ({
  stats: defaultStats,
  checkIns: [],
  documents: [],
  chartData: [],
  weeklyChartData: [],
  searchQuery: "",

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchStats: async () => {
    try {
      const data = await healthService.getDashboardStats();

      // Map backend keys → StatCard array expected by <StatCard /> component
      const mappedStats: StatCard[] = [
        {
          id:    "checkins-today",
          title: "My Check-ins Today",
          value: String(data?.my_checkins_today     ?? 0),
          icon:  "check-circle",
        },
        {
          id:    "reports-submitted",
          title: "Reports Submitted",
          value: String(data?.reports_submitted     ?? 0),
          icon:  "clipboard",
        },
        {
          id:    "pending-reports",
          title: "Pending Reports",
          value: String(data?.pending_reports       ?? 0),
          icon:  "calendar",
        },
        {
          id:    "active-distress",
          title: "Active Distress Cases",
          value: String(data?.active_distress_cases ?? 0),
          icon:  "activity",
        },
      ];

      set({ stats: mappedStats });
    } catch (error) {
      console.error("Failed to fetch health dashboard stats:", error);
    }
  },

  fetchCheckIns: async (params) => {
    try {
      const data = await healthService.getCheckIns(params);
      set({ checkIns: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch my check-ins:", error);
    }
  },

  fetchDocuments: async (params) => {
    try {
      const data = await healthService.getRecentDocuments(params);
      set({ documents: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch my reports:", error);
    }
  },

  fetchChartData: async () => {
    try {
      const data = await healthService.getChartData("day");
      set({ chartData: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch daily chart data:", error);
    }
  },

  fetchWeeklyChartData: async () => {
    try {
      const data = await healthService.getChartData("week");
      set({ weeklyChartData: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch weekly chart data:", error);
    }
  },
}));
