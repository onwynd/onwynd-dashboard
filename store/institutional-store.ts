import { create } from "zustand";
import { institutionalService, Member } from "@/lib/api/institutional";
import { parseApiResponse } from "@/lib/api/utils";

export interface Referral {
  id: number;
  uuid: string;
  ambassador_id: number;
  referred_user_id: number;
  status: "pending" | "completed" | "cancelled" | "active";
  amount: number | null;
  created_at: string;
  // UI helpers (would come from joins/resources)
  patientName?: string;
  program?: string;
  doctor?: string;
  doctorName?: string;
}

export interface InstitutionalMetrics {
  total_users: number;
  active_users_this_month: number;
  engagement_rate: number;
  total_sessions_completed: number;
  average_wellness_score: number | null;
  at_risk_users: number;
  intervention_success_rate: number;
  cost_per_user: number;
  estimated_roi: number | null;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url?: string;
}

export interface ChartDataPoint {
  name: string;
  active: number;
  pending: number;
}

export interface InstitutionalStat {
  id: string;
  title: string;
  value: string;
  icon: string;
}

interface InstitutionalDashboardState {
  referrals: Referral[];
  documents: Document[];
  chartData: ChartDataPoint[];
  stats: InstitutionalStat[];
  metrics: InstitutionalMetrics | null;
  members: Member[];
  plans: unknown[];
  searchQuery: string;
  paywallCode: string | null;
  orgType: string | null;
  orgId: string | number | null;
  setSearchQuery: (query: string) => void;
  getFilteredReferrals: () => Referral[];

  // API Actions
  fetchStats: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchReferrals: (params?: Record<string, unknown>) => Promise<void>;
  fetchDocuments: (params?: Record<string, unknown>) => Promise<void>;
  fetchMembers: (organizationId: string | number, params?: Record<string, unknown>) => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  createReferral: (data: Record<string, unknown>) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string | number) => Promise<void>;
}

export const useInstitutionalStore = create<InstitutionalDashboardState>((set, get) => ({
  referrals: [],
  documents: [],
  chartData: [],
  stats: [],
  metrics: null,
  members: [],
  plans: [],
  searchQuery: "",
  paywallCode: null,
  orgType: null,
  orgId: null,
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  getFilteredReferrals: () => {
    const { referrals, searchQuery } = get();
    if (!searchQuery) return referrals;
    const query = searchQuery.toLowerCase();
    return referrals.filter(
      (referral) =>
        (referral.patientName?.toLowerCase() || "").includes(query) ||
        (referral.program?.toLowerCase() || "").includes(query) ||
        (referral.doctorName?.toLowerCase() || "").includes(query)
    );
  },

  fetchStats: async () => {
    try {
      const data = await institutionalService.getStats();
      set({ stats: data });
    } catch (error: unknown) {
      const axiosErr = error as { response?: { status?: number; data?: { code?: string } } };
      if (axiosErr?.response?.status === 402) {
        const code = axiosErr.response?.data?.code ?? "SUBSCRIPTION_EXPIRED";
        set({ paywallCode: code });
      }
    }
  },

  fetchMetrics: async () => {
    try {
      const data = await institutionalService.getMetrics();
      set({ metrics: data });
    } catch {
      // silent
    }
  },

  fetchReferrals: async (params) => {
    try {
      const response = await institutionalService.getReferrals(params);
      const data = parseApiResponse(response);
      set({ referrals: Array.isArray(data) ? data : [] });
    } catch {
      set({ referrals: [] });
    }
  },

  fetchDocuments: async (params) => {
    try {
      const response = await institutionalService.getRecentDocuments(params);
      const data = parseApiResponse(response);
      set({ documents: Array.isArray(data) ? data : [] });
    } catch {
      set({ documents: [] });
    }
  },

  fetchMembers: async (organizationId, params) => {
    try {
      const response = await institutionalService.getMembers(organizationId, params);
      const data = parseApiResponse(response);
      set({ members: Array.isArray(data) ? data : [] });
    } catch {
      set({ members: [] });
    }
  },

  fetchPlans: async () => {
    try {
      const response = await institutionalService.getPlans();
      const data = parseApiResponse(response);
      set({ plans: Array.isArray(data) ? data : [] });
    } catch {
      set({ plans: [] });
    }
  },

  fetchOrganization: async () => {
    try {
      const org = await institutionalService.getOrganization();
      if (org) {
        const updates: { orgType?: string; orgId?: string | number } = {};
        // Backend may return 'org_type' (billing table) or 'type' (organizations table)
        const resolvedType = (org as Record<string, unknown>).org_type ?? (org as Record<string, unknown>).type;
        if (resolvedType) updates.orgType = resolvedType as string;
        if (org.id) updates.orgId = org.id;
        set(updates);
      }
    } catch {
      // Non-critical — org_type branching is best-effort
    }
  },

  createReferral: async (data) => {
    try {
      const newReferral = await institutionalService.createReferral(data);
      set((state) => ({
        referrals: [newReferral as Referral, ...state.referrals]
      }));
    } catch (error) {
      throw error;
    }
  },

  uploadDocument: async (file) => {
    try {
      const newDoc = await institutionalService.uploadDocument(file);
      set((state) => ({ documents: [newDoc as Document, ...state.documents] }));
    } catch (error) {
      throw error;
    }
  },

  deleteDocument: async (id) => {
    try {
      await institutionalService.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
