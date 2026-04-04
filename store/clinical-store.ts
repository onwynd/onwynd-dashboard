import { create } from "zustand";
import { clinicalService } from "@/lib/api/clinical";

export type LayoutDensity = "comfortable" | "compact" | "default";

export interface DistressQueueItem {
  id: string;
  session_id: string;
  member_id: string;
  organization_id: number | null;
  risk_level: 'low' | 'medium' | 'high' | 'severe' | 'critical';
  flagged_at: string;
  message_preview: string;
  resources_shown: boolean;
  type: 'ai_conversation';
}

export interface SessionReview {
  id: string;
  uuid: string;
  session_id: string;
  user_id: string;
  therapist_id: string;
  review_status: 'pending' | 'approved' | 'flagged' | 'escalated';
  risk_level: string;
  created_at: string;
  updated_at: string;
  therapy_session?: unknown;
  therapist?: unknown;
  user?: unknown;
}

export interface ClinicalStat {
  title: string;
  value: string;
  subtitle: string;
  iconName?: string;
}

export type Patient = {
  id: string | number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string | null;
  department?: string | null;
  status?: string | null;
  is_active?: boolean;
  created_at: string;
  [key: string]: unknown;
};

export type FinancialFlowEntry = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange?: number;
  moneyOutChange?: number;
};

interface ClinicalState {
  // ── Data ──────────────────────────────────────────────────────────────────
  stats: ClinicalStat[];
  distressQueue: DistressQueueItem[];
  reviews: SessionReview[];
  patients: Patient[];
  financialFlow: FinancialFlowEntry[];
  loading: boolean;
  error: string | null;

  // ── Layout toggles ────────────────────────────────────────────────────────
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showTable: boolean;
  showChart: boolean;
  layoutDensity: LayoutDensity;

  // ── Filter state ──────────────────────────────────────────────────────────
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;

  // ── API Actions ───────────────────────────────────────────────────────────
  fetchStats: () => Promise<void>;
  fetchDistressQueue: (page?: number) => Promise<void>;
  fetchReviews: (params?: Record<string, unknown>) => Promise<void>;
  fetchPatients: () => Promise<void>;
  fetchFinancialFlow: (period?: string) => Promise<void>;
  resolveDistressItem: (id: string, resolution_type: string, notes?: string) => Promise<void>;
  processReview: (id: string, action: 'approve' | 'flag' | 'escalate', data: Record<string, unknown>) => Promise<void>;

  // ── Layout setters ────────────────────────────────────────────────────────
  setShowAlertBanner: (v: boolean) => void;
  setShowStatsCards: (v: boolean) => void;
  setShowTable: (v: boolean) => void;
  setShowChart: (v: boolean) => void;
  setLayoutDensity: (v: LayoutDensity) => void;
  resetLayout: () => void;

  // ── Filter setters ────────────────────────────────────────────────────────
  setSearchQuery: (v: string) => void;
  setDepartmentFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  clearFilters: () => void;
}

export const useClinicalStore = create<ClinicalState>((set, get) => ({
  // ── Initial data state ────────────────────────────────────────────────────
  stats: [
    { title: "Distress Queue", value: "0", subtitle: "Pending AI review", iconName: "alert-triangle" },
    { title: "Session Audit", value: "0", subtitle: "Pending clinical review", iconName: "file-text" },
    { title: "Escalated", value: "0", subtitle: "Active crisis cases", iconName: "info" },
  ],
  distressQueue: [],
  reviews: [],
  patients: [],
  financialFlow: [],
  loading: false,
  error: null,

  // ── Initial layout state ─────────────────────────────────────────────────
  showAlertBanner: true,
  showStatsCards: true,
  showTable: true,
  showChart: true,
  layoutDensity: "comfortable",

  // ── Initial filter state ──────────────────────────────────────────────────
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",

  // ── API Actions ───────────────────────────────────────────────────────────
  fetchStats: async () => {
    await Promise.all([
      get().fetchDistressQueue(),
      get().fetchReviews({ status: 'pending' }),
    ]);
  },

  fetchDistressQueue: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await clinicalService.getDistressQueue(page);
      const queue = response.data || [];
      set((state) => ({
        distressQueue: queue,
        loading: false,
        stats: state.stats.map((s) =>
          s.title === "Distress Queue" ? { ...s, value: queue.length.toString() } : s
        ),
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch distress queue";
      set({ error: msg, loading: false });
    }
  },

  fetchReviews: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await clinicalService.getReviews(params as Record<string, unknown> | undefined);
      const reviews = response.data || response || [];
      set((state) => ({
        reviews,
        loading: false,
        stats: state.stats.map((s) => {
          if (s.title === "Session Audit")
            return { ...s, value: reviews.filter((r: SessionReview) => r.review_status === 'pending').length.toString() };
          if (s.title === "Escalated")
            return { ...s, value: reviews.filter((r: SessionReview) => r.review_status === 'escalated').length.toString() };
          return s;
        }),
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch session reviews";
      set({ error: msg, loading: false });
    }
  },

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await (clinicalService as unknown as { getPatients?: () => Promise<{ data?: Patient[] } | Patient[]> }).getPatients?.();
      const data = (response as { data?: Patient[] })?.data ?? (response as Patient[]) ?? [];
      set({ patients: Array.isArray(data) ? data : [], loading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch patients";
      set({ error: msg, loading: false, patients: [] });
    }
  },

  fetchFinancialFlow: async (period = "year") => {
    try {
      const response = await (clinicalService as unknown as {
        getFinancialFlow?: (p: string) => Promise<{ data?: FinancialFlowEntry[] } | FinancialFlowEntry[]>
      }).getFinancialFlow?.(period);
      const data = (response as { data?: FinancialFlowEntry[] })?.data ?? (response as FinancialFlowEntry[]) ?? [];
      set({ financialFlow: Array.isArray(data) ? data : [] });
    } catch {
      set({ financialFlow: [] });
    }
  },

  resolveDistressItem: async (id, resolution_type, notes) => {
    try {
      await clinicalService.resolveDistressItem(id, resolution_type, notes);
      get().fetchDistressQueue();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to resolve distress item";
      set({ error: msg });
      throw error;
    }
  },

  processReview: async (id, action, data) => {
    try {
      if (action === 'approve') {
        await clinicalService.approveReview(id, data.notes as string);
      } else if (action === 'flag') {
        await clinicalService.flagReview(id, data.reason as string, data.priority as string);
      } else if (action === 'escalate') {
        await clinicalService.escalateReview(id, data.reason as string);
      }
      get().fetchReviews();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to process review";
      set({ error: msg });
      throw error;
    }
  },

  // ── Layout setters ────────────────────────────────────────────────────────
  setShowAlertBanner: (v) => set({ showAlertBanner: v }),
  setShowStatsCards: (v) => set({ showStatsCards: v }),
  setShowTable: (v) => set({ showTable: v }),
  setShowChart: (v) => set({ showChart: v }),
  setLayoutDensity: (v) => set({ layoutDensity: v }),
  resetLayout: () =>
    set({
      showAlertBanner: true,
      showStatsCards: true,
      showTable: true,
      showChart: true,
      layoutDensity: "comfortable",
    }),

  // ── Filter setters ────────────────────────────────────────────────────────
  setSearchQuery: (v) => set({ searchQuery: v }),
  setDepartmentFilter: (v) => set({ departmentFilter: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  clearFilters: () => set({ searchQuery: "", departmentFilter: "all", statusFilter: "all" }),
}));
