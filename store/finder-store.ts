
// filepath: store/finder-store.ts
import { create } from "zustand";
import { finderService, Lead, FinderStats } from "@/lib/api/finder";

export type LayoutDensity = "comfortable" | "compact" | "default";

interface FinderState {
  leads: Lead[];
  stats: FinderStats | null;
  loadingLeads: boolean;
  loadingStats: boolean;
  error: string | null;
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  layoutDensity: LayoutDensity;

  fetchLeads: (params?: Record<string, unknown>) => Promise<void>;
  fetchStats: () => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setShowAlertBanner: (v: boolean) => void;
  setShowStatsCards: (v: boolean) => void;
  setShowChart: (v: boolean) => void;
  setShowTable: (v: boolean) => void;
  setLayoutDensity: (v: LayoutDensity) => void;
  resetLayout: () => void;
}

export const useFinderStore = create<FinderState>((set, get) => ({
  leads: [],
  stats: null,
  loadingLeads: true,
  loadingStats: true,
  error: null,
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  layoutDensity: "comfortable",

  fetchLeads: async (params) => {
    set({ loadingLeads: true });
    const { data, error } = await finderService.getLeads(params);
    if (data) {
      set({ leads: data, loadingLeads: false });
    } else {
      set({ loadingLeads: false, error: error });
    }
  },

  fetchStats: async () => {
    set({ loadingStats: true });
    const { data, error } = await finderService.getStats();
    if (data) {
      set({ stats: data, loadingStats: false });
    } else {
      set({ loadingStats: false, error: error });
    }
  },

  deleteLead: async (id: string) => {
    const { error } = await finderService.deleteLead(id);
    if (!error) {
      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
      }));
    }
  },

  setShowAlertBanner: (v) => set({ showAlertBanner: v }),
  setShowStatsCards: (v) => set({ showStatsCards: v }),
  setShowChart: (v) => set({ showChart: v }),
  setShowTable: (v) => set({ showTable: v }),
  setLayoutDensity: (v) => set({ layoutDensity: v }),
  resetLayout: () => set({ showAlertBanner: true, showStatsCards: true, showChart: true, showTable: true, layoutDensity: "comfortable" }),
}));
