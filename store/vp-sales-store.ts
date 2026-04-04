import { create } from "zustand";
import client from "@/lib/api/client";

interface VpSalesState {
  isLoading: boolean;
  error: string | null;
  totalLeads: number | null;
  dealsClosedMtd: number | null;
  pipelineValue: number | null;
  winRate: number | null;
  avgDealSize: number | null;
  revenueTargetPct: number | null;
  pipelineStages: { stage: string; count: number; value: number }[];
  topDeals: { id: number | string; name: string; value: number; stage: string; owner?: string; close_date?: string }[];
  teamLeaderboard: { name: string; deals_closed: number; revenue: number }[];
  fetchAll: () => Promise<void>;
}

export const useVpSalesStore = create<VpSalesState>((set) => ({
  isLoading: false,
  error: null,
  totalLeads: null,
  dealsClosedMtd: null,
  pipelineValue: null,
  winRate: null,
  avgDealSize: null,
  revenueTargetPct: null,
  pipelineStages: [],
  topDeals: [],
  teamLeaderboard: [],

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/sales/dashboard");
      const d = res.data?.data ?? res.data ?? {};
      set({
        totalLeads: d.total_leads ?? null,
        dealsClosedMtd: d.deals_closed_mtd ?? null,
        pipelineValue: d.pipeline_value ?? null,
        winRate: d.win_rate ?? null,
        avgDealSize: d.avg_deal_size ?? null,
        revenueTargetPct: d.revenue_target_pct ?? null,
        pipelineStages: Array.isArray(d.pipeline_stages) ? d.pipeline_stages : [],
        topDeals: Array.isArray(d.top_deals) ? d.top_deals : [],
        teamLeaderboard: Array.isArray(d.team_leaderboard) ? d.team_leaderboard : [],
      });
    } catch {
      set({ error: "Failed to load sales data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
