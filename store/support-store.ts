import { create } from "zustand";
import { supportService } from "@/lib/api/support";

export interface SupportTicket {
  id: number;
  uuid: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  user_id: number;
  assigned_to: number | null;
  last_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  // UI helpers
  requester?: {
    name: string;
    avatar: string;
  };
  created?: string; // Compatibility
}

export interface SupportStat {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}

interface SupportState {
  stats: SupportStat[];
  tickets: SupportTicket[];
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  layoutDensity: "default" | "comfortable" | "compact";
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setPriorityFilter: (filter: string) => void;
  setLayoutDensity: (density: "default" | "comfortable" | "compact") => void;
  clearFilters: () => void;
  
  // API Actions
  fetchStats: () => Promise<void>;
  fetchTickets: (params?: Record<string, unknown>) => Promise<void>;
}

export const useSupportStore = create<SupportState>((set) => ({
  stats: [],
  tickets: [],
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",
  layoutDensity: "default",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setPriorityFilter: (filter) => set({ priorityFilter: filter }),
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  clearFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "all",
      priorityFilter: "all",
    }),

  fetchStats: async () => {
    try {
      const data = await supportService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch support stats:", error);
    }
  },

  fetchTickets: async (params) => {
    try {
      const data = await supportService.getTickets(params);
      set({ tickets: data });
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  },
}));
