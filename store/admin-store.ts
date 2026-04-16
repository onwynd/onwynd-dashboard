
// filepath: store/admin-store.ts
import { create } from "zustand";
import { adminService } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";

// Define interfaces for the data models
export interface AdminStat {
  id?: string;
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeValue?: string;
  isPositive?: boolean;
  icon?: string;
  iconName?: string;
}

export interface RevenueFlowEntry {
  month: string;
  revenue: number;
}

export interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
}

export interface ActiveUser {
  id: string;
  name: string;
  last_seen: string;
}

export interface QuotaOverview {
    [key: string]: {
        limit: number;
        usage: number;
    };
}

export interface LeadSource {
  name: string;
  value: number;
}

export interface QuotaAnalyticsEntry {
  date?: string;
  active_users: number;
  ai_messages_sent: number;
  activities_logged: number;
  quota_overages: number;
}

export interface QuotaOverageEntry {
  user_id: number;
  user_name: string;
  user_email: string;
  feature: string;
  usage: number;
  limit: number;
  overage: number;
  last_occurrence: string;
}

interface AdminState {
  stats: AdminStat[];
  revenueFlow: RevenueFlowEntry[];
  deals: Deal[];
  activeUsers: ActiveUser[];
  quotaOverview: QuotaOverview | null;
  leadSources: LeadSource[];
  quotaAnalytics: QuotaAnalyticsEntry[];
  quotaOverages: QuotaOverageEntry[];
  isLoading: boolean;
  loadingStats: boolean;
  loadingRevenue: boolean;
  loadingDeals: boolean;
  loadingActiveUsers: boolean;
  loadingQuota: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchRevenueFlow: (period?: string) => Promise<void>;
  fetchDeals: () => Promise<void>;
  fetchActiveUsers: () => Promise<void>;
  fetchQuotaOverview: () => Promise<void>;
  fetchQuotaAnalytics: (period?: string) => Promise<void>;
  fetchQuotaOverages: (params?: Record<string, unknown>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: [],
  revenueFlow: [],
  deals: [],
  activeUsers: [],
  quotaOverview: null,
  leadSources: [],
  quotaAnalytics: [],
  quotaOverages: [],
  isLoading: false,
  loadingStats: true,
  loadingRevenue: true,
  loadingDeals: true,
  loadingActiveUsers: true,
  loadingQuota: true,
  error: null,

  fetchStats: async () => {
    set({ loadingStats: true });
    const { data, error } = await adminService.getStats();
    if (data) {
      set({ stats: data, loadingStats: false });
    } else {
      set({ loadingStats: false, error: error });
      toast({ title: "Error", description: "Failed to load stats.", variant: "destructive" });
    }
  },

  fetchRevenueFlow: async (period = "monthly") => {
    set({ loadingRevenue: true });
    const { data, error } = await adminService.getRevenueFlow(period);
    if (data) {
      set({ revenueFlow: data, loadingRevenue: false });
    } else {
      set({ loadingRevenue: false, error: error });
      toast({ title: "Error", description: "Failed to load revenue flow.", variant: "destructive" });
    }
  },

  fetchDeals: async () => {
    set({ loadingDeals: true });
    const { data, error } = await adminService.getDeals();
    if (data) {
      set({ deals: data, loadingDeals: false });
    } else {
      set({ loadingDeals: false, error: error });
      toast({ title: "Error", description: "Failed to load deals.", variant: "destructive" });
    }
  },

  fetchActiveUsers: async () => {
    set({ loadingActiveUsers: true });
    const { data, error } = await adminService.getActiveUsers();
    if (data) {
      set({ activeUsers: data, loadingActiveUsers: false });
    } else {
      set({ loadingActiveUsers: false, error: error });
      toast({ title: "Error", description: "Failed to load active users.", variant: "destructive" });
    }
  },

  fetchQuotaOverview: async () => {
    set({ loadingQuota: true });
    const { data, error } = await adminService.getQuotaOverview();
    if (data) {
      set({ quotaOverview: data, loadingQuota: false });
    } else {
      set({ loadingQuota: false, error: error });
      toast({ title: "Error", description: "Failed to load quota overview.", variant: "destructive" });
    }
  },

  fetchQuotaAnalytics: async (period) => {
    set({ isLoading: true });
    const { data } = await adminService.getQuotaAnalytics(period);
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    set({ quotaAnalytics: list, isLoading: false });
  },

  fetchQuotaOverages: async (params) => {
    const { data } = await adminService.getQuotaOverages(params);
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    set({ quotaOverages: list });
  },
}));
