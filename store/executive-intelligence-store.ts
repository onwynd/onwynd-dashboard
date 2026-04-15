import { create } from "zustand";
import { executiveIntelligenceService } from "@/lib/api/executive-intelligence";
import type { ExecutiveFinanceSnapshot } from "@/types/executive-intelligence";

interface ExecutiveIntelligenceState {
  snapshot: ExecutiveFinanceSnapshot | null;
  isLoading: boolean;
  error?: string;
  lastFetchedDate: string | null;
  fetchSnapshot: (force?: boolean) => Promise<void>;
}

function getDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const useExecutiveIntelligenceStore = create<ExecutiveIntelligenceState>((set, get) => ({
  snapshot: null,
  isLoading: false,
  error: undefined,
  lastFetchedDate: null,

  fetchSnapshot: async (force = false) => {
    const today = getDateKey();
    const current = get();
    if (!force && current.snapshot && current.lastFetchedDate === today) return;

    set({ isLoading: true, error: undefined });
    try {
      const snapshot = await executiveIntelligenceService.getFinanceSnapshot();
      set({ snapshot, lastFetchedDate: today, error: undefined });
    } catch {
      set({ error: "Unable to load executive intelligence data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
