import { create } from "zustand";
import { supportService } from "@/lib/api/support";
import { techService } from "@/lib/api/tech";
import { marketingService } from "@/lib/api/marketing";
import { salesService } from "@/lib/api/sales";
import { institutionalService } from "@/lib/api/institutional";

type KPI = {
  id: string;
  title: string;
  value: string;
};

type SeriesPoint = {
  name: string;
  value: number;
};

type Period = "7days" | "30days" | "3months" | "6months" | "12months";

interface COOState {
  isLoading: boolean;
  period: Period;
  error?: string;
  kpis: KPI[];
  funnelSeries: SeriesPoint[];
  channelCac: { name: string; value: number }[];
  customerHealth: { name: string; value: number }[];
  teamProductivity: { name: string; value: number }[];
  setPeriod: (p: Period) => void;
  fetchAll: () => Promise<void>;
}

export const useCOOStore = create<COOState>((set, get) => ({
  isLoading: false,
  period: "30days",
  error: undefined,
  kpis: [],
  funnelSeries: [],
  channelCac: [],
  customerHealth: [],
  teamProductivity: [],
  setPeriod: (p) => {
    set({ period: p });
    get().fetchAll();
  },
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const selected = get().period;
      const leadPeriod = selected === "3months" ? "90days" : selected;
      const [supportStatsRes, techStatsRes, marketingLeadSourcesRes, salesStatsRes, instMetrics] = await Promise.all([
        supportService.getStats(),
        techService.getStats(),
        marketingService.getLeadSources(leadPeriod),
        salesService.getStats(),
        institutionalService.getMetrics(),
      ]);

      const kpis: KPI[] = [];
      const supportStats = supportStatsRes?.data || supportStatsRes;
      if (supportStats) {
        if (supportStats.avg_response_time) kpis.push({ id: "resp", title: "Avg Response Time", value: String(supportStats.avg_response_time) });
        if (supportStats.open_tickets) kpis.push({ id: "tickets", title: "Open Tickets", value: String(supportStats.open_tickets) });
      }
      const tStats = techStatsRes?.data || techStatsRes;
      if (tStats) {
        if (tStats.uptime) kpis.push({ id: "uptime", title: "Uptime", value: String(tStats.uptime) + "%" });
        if (tStats.incidents_7d) kpis.push({ id: "incidents", title: "Incidents (7d)", value: String(tStats.incidents_7d) });
      }
      const sStats = (salesStatsRes as any)?.data || salesStatsRes;
      if (sStats) {
        if (sStats.conversion_rate) kpis.push({ id: "conv", title: "Conversion Rate", value: String(sStats.conversion_rate) + "%" });
        if (sStats.avg_deal_size) kpis.push({ id: "deal", title: "Avg Deal Size", value: String(sStats.avg_deal_size) });
      }
      const metrics = instMetrics || {};
      if (metrics.engagement_rate != null) kpis.push({ id: "eng", title: "Engagement Rate", value: String(metrics.engagement_rate) + "%" });
      if (metrics.at_risk_users != null) kpis.push({ id: "risk", title: "At-Risk Accounts", value: String(metrics.at_risk_users) });

      const funnelSeries: SeriesPoint[] = [
        { name: "Leads", value: Number(sStats?.leads ?? sStats?.leads_count ?? 0) },
        { name: "MQL", value: Number(sStats?.mql ?? 0) },
        { name: "SQL", value: Number(sStats?.sql ?? 0) },
        { name: "Opportunities", value: Number(sStats?.opportunities ?? 0) },
        { name: "Won", value: Number(sStats?.won ?? 0) },
      ];

      type LeadRow = { name?: string; source?: string; cac?: number; cost_per_acquisition?: number };
      const channelCac = Array.isArray(marketingLeadSourcesRes?.data)
        ? (marketingLeadSourcesRes.data as LeadRow[]).map((d) => ({
            name: String(d.name ?? d.source ?? ""),
            value: Number(d.cac ?? d.cost_per_acquisition ?? 0),
          }))
        : [];

      const customerHealth = [
        { name: "Active", value: Number(metrics?.active_users_this_month ?? 0) },
        { name: "At-Risk", value: Number(metrics?.at_risk_users ?? 0) },
      ];

      const teamProductivity = [
        { name: "Tickets Resolved", value: Number(supportStats?.tickets_resolved_7d ?? 0) },
        { name: "Deployments", value: Number(tStats?.deployments_7d ?? 0) },
      ];

      set({ kpis, funnelSeries, channelCac, customerHealth, teamProductivity, error: undefined });
    } catch {
      set({ kpis: [], funnelSeries: [], channelCac: [], customerHealth: [], teamProductivity: [], error: "Failed to load COO dashboard data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
