
// filepath: store/closer-store.ts
import { create } from "zustand";
import { salesService } from "@/lib/api/sales";
import { toast } from "@/components/ui/use-toast";

export interface Deal {
  id: string;
  client_name: string;
  name: string;
  value: number;
  status: 'won' | 'lost' | string;
  stage: 'won' | 'lost' | string;
  last_contact_at: string;
  stale_at: string;
  created_at: string;
  lost_reason?: string | null;
}

interface CloserDashboardData {
    pipeline_value: number;
    closed_this_month: number;
    stale_deals_count: number;
    action_required: Deal[];
}

interface CloserState {
  dashboardData: CloserDashboardData | null;
  closedDeals: Deal[];
  loadingDashboard: boolean;
  loadingHistory: boolean;
  error: string | null;

  normalizeDeal: (deal: Record<string, unknown>) => Deal;
  fetchDashboard: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  markDealWon: (id: string) => Promise<void>;
  markDealLost: (id: string, reason: string) => Promise<void>;
}

function normalizeDealRecord(deal: Record<string, unknown>): Deal {
  const clientName = String(deal.client_name ?? deal.name ?? "Unknown");
  const status = String(deal.status ?? deal.stage ?? "open");
  const lastContactAt = String(
    deal.last_contact_at ?? deal.stale_at ?? deal.created_at ?? new Date().toISOString(),
  );

  return {
    id: String(deal.id ?? ""),
    client_name: clientName,
    name: clientName,
    value: Number(deal.value ?? 0),
    status,
    stage: status,
    last_contact_at: lastContactAt,
    stale_at: lastContactAt,
    created_at: String(deal.created_at ?? new Date().toISOString()),
    lost_reason: typeof deal.lost_reason === "string" ? deal.lost_reason : null,
  };
}

export const useCloserStore = create<CloserState>((set, get) => ({
  dashboardData: null,
  closedDeals: [],
  loadingDashboard: true,
  loadingHistory: true,
  error: null,

  normalizeDeal: normalizeDealRecord,

  fetchDashboard: async () => {
    set({ loadingDashboard: true });
    const { data, error } = await salesService.getDashboard();
    if (data) {
      const typed = data as any;
      const normalizeDeal = get().normalizeDeal;
      const normalized: CloserDashboardData = {
        pipeline_value:
          typed.pipeline_value ??
          (Array.isArray(typed.pipeline)
            ? typed.pipeline.reduce((sum: number, d: any) => sum + Number(d.value ?? 0), 0)
            : 0),
        closed_this_month:
          typed.closed_this_month ??
          Number(typed.performance?.this_month?.value ?? 0),
        stale_deals_count:
          typed.stale_deals_count ??
          (Array.isArray(typed.awaiting_action) ? typed.awaiting_action.length : 0),
        action_required: (typed.action_required ?? typed.awaiting_action ?? [])
          .map((deal: Record<string, unknown>) => normalizeDeal(deal)),
      };

      set({ dashboardData: normalized, loadingDashboard: false });
    } else {
      set({ loadingDashboard: false, error: error });
    }
  },

  fetchHistory: async () => {
    set({ loadingHistory: true });
    const { data, error } = await salesService.getClosedDeals();
    
    if (data) {
        const normalizeDeal = get().normalizeDeal;
        const sortedDeals = (data as Array<Record<string, unknown>>)
          .map((deal) => normalizeDeal(deal))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        set({ closedDeals: sortedDeals, loadingHistory: false });
    } else {
        set({ loadingHistory: false, error: error });
        toast({ title: "Error", description: "Failed to load deal history.", variant: "destructive" });
    }
  },

  markDealWon: async (id: string) => {
    const { error } = await salesService.markDealWon(id);
    if (!error) {
      get().fetchDashboard(); // Refresh dashboard data
    }
  },

  markDealLost: async (id: string, reason: string) => {
    const { error } = await salesService.markDealLost(id, reason);
    if (!error) {
      get().fetchDashboard(); // Refresh dashboard data
    }
  },
}));
