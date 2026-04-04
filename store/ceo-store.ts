import { create } from "zustand";
import { financeService } from "@/lib/api/finance";
import { adminService } from "@/lib/api/admin";
import { marketingService } from "@/lib/api/marketing";
import { salesService } from "@/lib/api/sales";

type KPI = {
  id: string;
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
};

type SeriesPoint = {
  name: string;
  value: number;
  value2?: number;
};

type Period = "7days" | "30days" | "3months" | "6months" | "12months";

interface CEOState {
  isLoading: boolean;
  period: Period;
  error?: string;
  kpis: KPI[];
  revenueSeries: SeriesPoint[];
  userGrowthSeries: SeriesPoint[];
  leadSources: { name: string; value: number }[];
  alerts: { id: string; message: string; level: string }[];
  setPeriod: (p: Period) => void;
  fetchAll: () => Promise<void>;
}

export const useCEOStore = create<CEOState>((set, get) => ({
  isLoading: false,
  period: "6months",
  error: undefined,
  kpis: [],
  revenueSeries: [],
  userGrowthSeries: [],
  leadSources: [],
  alerts: [],
  setPeriod: (p) => {
    set({ period: p });
    get().fetchAll();
  },
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const selected = get().period;
      const revenuePeriod = (() => {
        switch (selected) {
          case "7days":
          case "30days":
            return "daily";
          case "3months":
          case "6months":
            return "monthly";
          case "12months":
            return "monthly";
          default:
            return "monthly";
        }
      })();
      const [finStatsRes, finRevenueRes, adminStatsRes, userGrowthRes, leadSrcRes, salesStatsRes] = await Promise.all([
        financeService.getStats(),
        financeService.getRevenueData(revenuePeriod),
        adminService.getStats(),
        adminService.getUserGrowthReport({ period: selected }),
        marketingService.getLeadSources(selected === "7days" ? "7days" : selected === "3months" ? "90days" : selected),
        salesService.getStats(),
      ]);

      const kpis: KPI[] = [];
      const finStats = finStatsRes?.data || finStatsRes;
      if (finStats) {
        if (finStats.mrr) kpis.push({ id: "mrr", title: "MRR", value: String(finStats.mrr) });
        if (finStats.arr) kpis.push({ id: "arr", title: "ARR", value: String(finStats.arr) });
        if (finStats.burn_rate) kpis.push({ id: "burn", title: "Burn Rate", value: String(finStats.burn_rate) });
        if (finStats.runway_months) kpis.push({ id: "runway", title: "Runway", value: String(finStats.runway_months) + " mo" });
      }
      const aStats = (adminStatsRes as any)?.data || adminStatsRes;
      if (aStats) {
        if (aStats.total_users) kpis.push({ id: "users", title: "Active Users", value: String(aStats.total_users) });
        if (aStats.new_signups) kpis.push({ id: "new", title: "New Signups", value: String(aStats.new_signups) });
        if (aStats.churn_rate) kpis.push({ id: "churn", title: "Churn Rate", value: String(aStats.churn_rate) + "%" });
      }
      const sStats = (salesStatsRes as any)?.data || salesStatsRes;
      if (sStats) {
        if (sStats.cac) kpis.push({ id: "cac", title: "CAC", value: String(sStats.cac) });
        if (sStats.ltv) kpis.push({ id: "ltv", title: "LTV", value: String(sStats.ltv) });
        if (sStats.ltv_cac_ratio) kpis.push({ id: "ltv_cac", title: "LTV:CAC", value: String(sStats.ltv_cac_ratio) });
      }

      type RevenueRow = { name?: string; month?: string; period?: string; revenue?: number; value?: number; expenses?: number };
      const revenueSeries: SeriesPoint[] = Array.isArray(finRevenueRes?.data)
        ? (finRevenueRes.data as RevenueRow[]).map((d) => ({
            name: String(d.name ?? d.month ?? d.period ?? ""),
            value: Number(d.revenue ?? d.value ?? 0),
            value2: Number(d.expenses ?? 0),
          }))
        : [];

      type GrowthRow = { name?: string; month?: string; period?: string; users?: number; value?: number; count?: number };
      const userGrowthSeries: SeriesPoint[] = Array.isArray((userGrowthRes as any)?.data)
        ? ((userGrowthRes as any).data as GrowthRow[]).map((d) => ({
            name: String(d.name ?? d.month ?? d.period ?? ""),
            value: Number(d.users ?? d.value ?? d.count ?? 0),
          }))
        : [];

      type LeadRow = { name?: string; source?: string; value?: number; count?: number };
      const leadSources = Array.isArray(leadSrcRes?.data)
        ? (leadSrcRes.data as LeadRow[]).map((d) => ({
            name: String(d.name ?? d.source ?? ""),
            value: Number(d.value ?? d.count ?? 0),
          }))
        : [];

      type AlertRow = { id?: string | number; uuid?: string; message?: string; level?: string };
      const alerts =
        Array.isArray(aStats?.alerts) ? (aStats.alerts as AlertRow[]).map((x) => ({ id: String(x.id ?? x.uuid ?? x.message), message: String(x.message ?? ""), level: String(x.level ?? "info") })) : [];

      const computedAlerts: { id: string; message: string; level: string }[] = [];
      const lastRev = revenueSeries.at(-1);
      const prevRev = revenueSeries.length > 1 ? revenueSeries[revenueSeries.length - 2] : undefined;
      if (lastRev && typeof lastRev.value2 === "number" && lastRev.value2 > lastRev.value) {
        computedAlerts.push({ id: "neg-margin", message: "Expenses exceeded revenue in the latest period", level: "destructive" });
      }
      if (lastRev && prevRev && prevRev.value > 0) {
        const drop = (prevRev.value - lastRev.value) / prevRev.value;
        if (drop > 0.15) {
          computedAlerts.push({ id: "rev-drop", message: "Revenue dropped over 15% vs previous period", level: "warning" });
        }
      }
      const lastUsers = userGrowthSeries.at(-1)?.value ?? 0;
      const prevUsers = userGrowthSeries.length > 1 ? userGrowthSeries[userGrowthSeries.length - 2].value : undefined;
      if (prevUsers && prevUsers > 0) {
        const userDrop = (prevUsers - lastUsers) / prevUsers;
        if (userDrop > 0.1) {
          computedAlerts.push({ id: "user-drop", message: "User growth declined over 10% from previous period", level: "warning" });
        }
      }
      const churn = aStats?.churn_rate;
      if (typeof churn === "number" && churn > 5) {
        computedAlerts.push({ id: "high-churn", message: "Churn rate is above 5%", level: "warning" });
      }
      const ltvRatio = sStats?.ltv_cac_ratio;
      if (typeof ltvRatio === "number" && ltvRatio < 2) {
        computedAlerts.push({ id: "ltv-cac", message: "LTV:CAC ratio below 2", level: "warning" });
      }

      set({ kpis, revenueSeries, userGrowthSeries, leadSources, alerts: [...computedAlerts, ...alerts], error: undefined });
    } catch {
      set({ kpis: [], revenueSeries: [], userGrowthSeries: [], leadSources: [], alerts: [], error: "Failed to load CEO dashboard data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
