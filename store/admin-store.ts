import { create } from "zustand";
import { adminService } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";

interface StatItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  isPositive: boolean;
  change: string;
  changeValue: string;
  details?: string;
  variant?: string;
}

interface RevenueItem {
  name: string;
  value: number;
}

interface LeadSourceItem {
  name: string;
  value: number;
}

interface DealItem {
  id: string | number;
  dealName: string;
  client: string;
  value: number;
  stage: string;
  owner: string;
  ownerInitials: string;
  date: string;
  expectedClose: string;
  dealInitial: string;
  dealColor: string;
}

interface TherapistItem {
  id: string | number;
  name: string;
  specialty: string;
  status: string;
  date: string;
  avatar?: string;
  initials: string;
}

interface QuotaAnalyticsItem {
  date: string;
  total_users: number;
  active_users: number;
  ai_messages_sent: number;
  activities_logged: number;
  quota_overages: number;
  revenue_generated: number;
}

interface QuotaOverageItem {
  user_id: string | number;
  user_name: string;
  user_email: string;
  feature: string;
  usage: number;
  limit: number;
  overage: number;
  last_occurrence: string;
}

interface AdminState {
  stats: StatItem[];
  revenueFlow: RevenueItem[];
  leadSources: LeadSourceItem[];
  deals: DealItem[];
  pendingTherapists: TherapistItem[];
  quotaAnalytics: QuotaAnalyticsItem[];
  quotaOverages: QuotaOverageItem[];
  isLoading: boolean;
  
  // Filters
  searchQuery: string;
  stageFilter: string;
  ownerFilter: string;
  valueFilter: string;

  fetchStats: () => Promise<void>;
  fetchRevenueFlow: (period?: string) => Promise<void>;
  fetchLeadSources: (period?: string) => Promise<void>;
  fetchDeals: () => Promise<void>;
  fetchPendingTherapists: () => Promise<void>;
  approveTherapist: (id: string) => Promise<void>;
  rejectTherapist: (id: string, reason: string) => Promise<void>;
  fetchQuotaAnalytics: (period?: string) => Promise<void>;
  fetchQuotaOverages: (params?: Record<string, unknown>) => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  setStageFilter: (filter: string) => void;
  setOwnerFilter: (filter: string) => void;
  setValueFilter: (filter: string) => void;
  clearFilters: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: [],
  revenueFlow: [],
  leadSources: [],
  deals: [],
  pendingTherapists: [],
  quotaAnalytics: [],
  quotaOverages: [],
  isLoading: false,
  
  searchQuery: "",
  stageFilter: "all",
  ownerFilter: "all",
  valueFilter: "all",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStageFilter: (filter) => set({ stageFilter: filter }),
  setOwnerFilter: (filter) => set({ ownerFilter: filter }),
  setValueFilter: (filter) => set({ valueFilter: filter }),
  clearFilters: () => set({ 
    searchQuery: "", 
    stageFilter: "all", 
    ownerFilter: "all", 
    valueFilter: "all" 
  }),

  fetchStats: async () => {
    try {
      const data = await adminService.getStats();
      set({ stats: data as StatItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics. Please try again.",
        variant: "destructive"
      });
    }
  },
  fetchRevenueFlow: async (period = '6months') => {
    try {
      const data = await adminService.getRevenueFlow(period);
      set({ revenueFlow: data as RevenueItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load revenue flow data. Please try again.",
        variant: "destructive"
      });
    }
  },
  fetchLeadSources: async (period = '30days') => {
    try {
      const data = await adminService.getLeadSources(period);
      set({ leadSources: data as LeadSourceItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load lead sources data. Please try again.",
        variant: "destructive"
      });
    }
  },
  fetchDeals: async () => {
    try {
      const data = await adminService.getRecentDeals();
      set({ deals: data as DealItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load deals data. Please try again.",
        variant: "destructive"
      });
    }
  },
  fetchPendingTherapists: async () => {
    set({ isLoading: true });
    try {
      const data = await adminService.getPendingTherapists();
      set({ pendingTherapists: data as TherapistItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load pending therapists. Please try again.",
        variant: "destructive"
      });
    } finally {
      set({ isLoading: false });
    }
  },
  approveTherapist: async (id) => {
    try {
      await adminService.approveTherapist(id);
      // Refresh list
      const data = await adminService.getPendingTherapists();
      set({ pendingTherapists: data as TherapistItem[] | undefined });
      toast({
        title: "Success",
        description: "Therapist approved successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to approve therapist. Please try again.",
        variant: "destructive"
      });
    }
  },
  rejectTherapist: async (id, reason) => {
    try {
      await adminService.rejectTherapist(id, reason);
      // Refresh list
      const data = await adminService.getPendingTherapists();
      set({ pendingTherapists: data as TherapistItem[] | undefined });
      toast({
        title: "Success",
        description: "Therapist rejected successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to reject therapist. Please try again.",
        variant: "destructive"
      });
    }
  },

  fetchQuotaAnalytics: async (period = '30days') => {
    try {
      const data = await adminService.getQuotaOverages({ period });
      set({ quotaAnalytics: data as QuotaAnalyticsItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load quota analytics. Please try again.",
        variant: "destructive"
      });
    }
  },

  fetchQuotaOverages: async (params = {}) => {
    try {
      const data = await adminService.getQuotaOverages(params);
      set({ quotaOverages: data as QuotaOverageItem[] | undefined });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load quota overages. Please try again.",
        variant: "destructive"
      });
    }
  }
}));