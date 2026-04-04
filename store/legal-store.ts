import { create } from "zustand";
import { legalService } from "@/lib/api/legal";

export interface LegalStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

export interface LegalCase {
  id: string;
  title: string;
  type: "contract" | "compliance" | "dispute" | "advisory";
  status: "active" | "pending" | "closed" | "review";
  priority: "high" | "medium" | "low";
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  lastUpdated: string;
}

interface LegalState {
  stats: LegalStat[];
  cases: LegalCase[];
  layoutDensity: "default" | "comfortable" | "compact";
  caseFilter: string;
  setLayoutDensity: (density: "default" | "comfortable" | "compact") => void;
  setCaseFilter: (filter: string) => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchCases: (params?: Record<string, unknown>) => Promise<void>;
}

const initialStats: LegalStat[] = [];
const initialCases: LegalCase[] = [];

export const useLegalStore = create<LegalState>((set) => ({
  stats: initialStats,
  cases: initialCases,
  layoutDensity: "default",
  caseFilter: "active",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setCaseFilter: (filter) => set({ caseFilter: filter }),

  fetchStats: async () => {
    try {
      const data = await legalService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch legal stats:", error);
    }
  },

  fetchCases: async (params) => {
    try {
      const response = await legalService.getCases(params);
      const res = response as unknown;
      const data = (res as { data?: unknown }).data;
      const items = Array.isArray(data)
        ? (data as unknown[])
        : Array.isArray(res)
        ? (res as unknown[])
        : [];
      set({ cases: Array.isArray(items) ? (items as LegalCase[]) : [] });
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    }
  },
}));
