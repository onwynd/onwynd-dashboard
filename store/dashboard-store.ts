import { create } from "zustand";
import { dashboardService } from "@/lib/api/dashboard";

export interface Person {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  avatar: string;
  tags: string[];
  status: "active" | "offline" | "away";
  phone: string;
  address: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  updatedAt: string;
  author: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

interface DashboardState {
  people: Person[];
  documents: Document[];
  chartData: ChartDataPoint[];
  stats: StatCard[];
  searchQuery: string;
  isLoading: boolean;
  peopleError: string | null;
  documentsError: string | null;

  setSearchQuery: (query: string) => void;
  getFilteredPeople: () => Person[];

  // API Actions
  fetchStats: () => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
  fetchPeople: (params?: Record<string, unknown>) => Promise<void>;
  fetchDocuments: (params?: Record<string, unknown>) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  people: [],
  documents: [],
  chartData: [],
  stats: [],
  searchQuery: "",
  isLoading: false,
  peopleError: null,
  documentsError: null,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredPeople: () => {
    const { people, searchQuery } = get();
    if (!searchQuery) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.jobTitle.toLowerCase().includes(query) ||
        person.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  },

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const data = await dashboardService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchChartData: async (period) => {
    if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
      return;
    }
    try {
      const data = await dashboardService.getChartData(period);
      set({ chartData: data });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.status === 500
      ) {
        return;
      }
      console.error("Failed to fetch chart data:", error);
    }
  },

  fetchPeople: async (params) => {
    set({ peopleError: null });
    try {
      const data = await dashboardService.getPeople(params);
      set({ people: data });
    } catch (error) {
      console.error("Failed to fetch people:", error);
      set({ peopleError: "Failed to load people. Please refresh." });
    }
  },

  fetchDocuments: async (params) => {
    set({ documentsError: null });
    try {
      const data = await dashboardService.getDocuments(params);
      set({ documents: data });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      set({ documentsError: "Failed to load documents. Please refresh." });
    }
  },
}));
