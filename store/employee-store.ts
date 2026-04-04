import { create } from "zustand";
import { employeeService } from "@/lib/api/employee";

export interface Person {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: "active" | "offline" | "away";
  last_seen_at: string | null;
  profile_photo: string | null;
  jobTitle?: string; // UI helper
  tags?: string[]; // UI helper
  location?: string; // UI helper
  name?: string; // UI helper
  lastSeen?: string; // UI helper
}

export interface EmployeeDocument {
  id: number;
  uuid: string;
  name: string;
  path: string;
  type: string;
  size: number;
  extension: string;
  mime_type: string;
  created_at: string;
  // UI helpers
  author?: string;
  authorAvatar?: string;
  uploadedAt?: string;
  icon?: string;
}

export interface ChartDataPoint {
  name: string;
  completed: number;
  pending: number;
}

export interface EmployeeStat {
  id: string;
  title: string;
  value: string;
  icon: string;
}

interface EmployeeDashboardState {
  people: Person[];
  documents: EmployeeDocument[];
  chartData: ChartDataPoint[];
  stats: EmployeeStat[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredPeople: () => Person[];
  
  // API Actions
  fetchStats: () => Promise<void>;
  fetchPeople: (params?: Record<string, unknown>) => Promise<void>;
  fetchDocuments: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeDashboardState>((set, get) => ({
  people: [],
  documents: [],
  chartData: [],
  stats: [],
  searchQuery: "",
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  getFilteredPeople: () => {
    const { people, searchQuery } = get();
    if (!searchQuery) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        (person.first_name + " " + person.last_name).toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        (person.jobTitle?.toLowerCase() || "").includes(query) ||
        (person.tags?.some((tag) => tag.toLowerCase().includes(query)) || false)
    );
  },

  fetchStats: async () => {
    try {
      const data = await employeeService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch employee stats:", error);
    }
  },

  fetchPeople: async (params) => {
    try {
      const data = await employeeService.getPeople(params);
      set({ people: data });
    } catch (error) {
      console.error("Failed to fetch people:", error);
    }
  },

  fetchDocuments: async (params) => {
    try {
      const data = await employeeService.getRecentDocuments(params);
      set({ documents: data });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  },

  fetchChartData: async (period) => {
    try {
      const data = await employeeService.getChartData(period);
      set({ chartData: data });
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  },
}));
