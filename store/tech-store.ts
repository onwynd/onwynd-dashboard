import { create } from "zustand";
import { techService } from "@/lib/api/tech";

export interface TechStat {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: "activity" | "server" | "alert-triangle" | "clock";
}

export interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "critical" | "major" | "minor";
  updatedAt: string; // ISO string
  time?: string; // For backward compatibility if needed, or remove
}

export interface ChartData {
  time: string;
  requests: number;
  latency: number;
}

export interface LogEntry {
  id: string;
  level: string;
  message: string;
  service: string;
  timestamp: string;
  details?: unknown;
}

interface TechState {
  stats: TechStat[];
  incidents: Incident[];
  logs: LogEntry[];
  chartData: ChartData[];
  layoutDensity: "compact" | "default" | "comfortable";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showIncidents: boolean;
  showLogs: boolean;
  searchQuery: string;
  statusFilter: string;
  severityFilter: string;
  setLayoutDensity: (density: "compact" | "default" | "comfortable") => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowIncidents: (show: boolean) => void;
  setShowLogs: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setSeverityFilter: (filter: string) => void;
  clearFilters: () => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchIncidents: (params?: Record<string, unknown>) => Promise<void>;
  fetchLogs: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
}

export const useTechStore = create<TechState>((set) => ({
  stats: [],
  incidents: [],
  logs: [],
  chartData: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showIncidents: true,
  showLogs: true,
  searchQuery: "",
  statusFilter: "all",
  severityFilter: "all",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowIncidents: (show) => set({ showIncidents: show }),
  setShowLogs: (show) => set({ showLogs: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSeverityFilter: (filter) => set({ severityFilter: filter }),
  clearFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "all",
      severityFilter: "all",
    }),

  fetchStats: async () => {
    try {
      const data = await techService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch tech stats:", error);
    }
  },

  fetchIncidents: async (params) => {
    try {
      const data = await techService.getIncidents(params);
      set({ incidents: data });
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    }
  },

  fetchLogs: async (params) => {
    try {
      const data = await techService.getLogs(params);
      set({ logs: data.data || data }); // Handle paginated response
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  },

  fetchChartData: async (period) => {
    try {
      const data = await techService.getSystemHealth(period); 
      set({ chartData: data });
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  },
}));
