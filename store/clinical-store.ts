
// filepath: store/clinical-store.ts
import { create } from "zustand";
import { clinicalService, SessionReview, DistressQueueItem } from "@/lib/api/clinical";
import { toast } from "@/components/ui/use-toast";

export type LayoutDensity = "comfortable" | "compact" | "default";

export interface ClinicalStat {
  title: string;
  value: string;
  subtitle: string;
  iconName?: string;
}

interface ClinicalState {
  stats: ClinicalStat[];
  distressQueue: DistressQueueItem[];
  reviews: SessionReview[];
  loadingStats: boolean;
  loadingQueue: boolean;
  loadingReviews: boolean;
  error: string | null;
  layoutDensity: LayoutDensity;

  fetchStats: () => Promise<void>;
  fetchDistressQueue: (page?: number) => Promise<void>;
  fetchReviews: (params?: Record<string, unknown>) => Promise<void>;
  resolveDistressItem: (id: string, resolution_type: string, notes?: string) => Promise<void>;
  processReview: (id: string, action: "approve" | "flag" | "escalate", data: Record<string, unknown>) => Promise<void>;

  setLayoutDensity: (v: LayoutDensity) => void;
}

export const useClinicalStore = create<ClinicalState>((set, get) => ({
  stats: [
    { title: "Distress Queue", value: "0", subtitle: "Pending AI review", iconName: "alert-triangle" },
    { title: "Session Audit", value: "0", subtitle: "Pending clinical review", iconName: "file-text" },
    { title: "Escalated", value: "0", subtitle: "Active crisis cases", iconName: "info" },
  ],
  distressQueue: [],
  reviews: [],
  loadingStats: true,
  loadingQueue: true,
  loadingReviews: true,
  error: null,
  layoutDensity: "comfortable",

  fetchStats: async () => {
    set({ loadingStats: true });
    await Promise.all([
      get().fetchDistressQueue(),
      get().fetchReviews({ status: "pending" }),
    ]);
    set({ loadingStats: false });
  },

  fetchDistressQueue: async (page = 1) => {
    set({ loadingQueue: true });
    const { data, error } = await clinicalService.getDistressQueue(page);
    if (data) {
      set((state) => ({
        distressQueue: data as DistressQueueItem[],
        loadingQueue: false,
        stats: state.stats.map((s) =>
          s.title === "Distress Queue" ? { ...s, value: (data as DistressQueueItem[]).length.toString() } : s
        ),
      }));
    } else {
      set({ loadingQueue: false, error });
      toast({ title: "Error", description: "Failed to load distress queue.", variant: "destructive" });
    }
  },

  fetchReviews: async (params) => {
    set({ loadingReviews: true });
    const { data, error } = await clinicalService.getReviews(params as Record<string, unknown> | undefined);
    if (data) {
      set((state) => ({
        reviews: data as SessionReview[],
        loadingReviews: false,
        stats: state.stats.map((s) => {
          if (s.title === "Session Audit")
            return { ...s, value: (data as SessionReview[]).filter((r: SessionReview) => r.review_status === 'pending').length.toString() };
          if (s.title === "Escalated")
            return { ...s, value: (data as SessionReview[]).filter((r: SessionReview) => r.review_status === 'escalated').length.toString() };
          return s;
        }),
      }));
    } else {
      set({ loadingReviews: false, error });
      toast({ title: "Error", description: "Failed to load session reviews.", variant: "destructive" });
    }
  },

  resolveDistressItem: async (id, resolution_type, notes) => {
    const { data, error } = await clinicalService.resolveDistressItem(id, resolution_type, notes);
    if (data) {
      toast({ title: "Success", description: "Distress item resolved." });
      get().fetchDistressQueue();
    } else {
      toast({ title: "Error", description: `Failed to resolve distress item: ${error}` , variant: "destructive" });
    }
  },

  processReview: async (id, action, data) => {
    let res;
    if (action === 'approve') {
      res = await clinicalService.approveReview(id, data.notes as string);
    } else if (action === 'flag') {
      res = await clinicalService.flagReview(id, data.reason as string, data.priority as string);
    } else if (action === 'escalate') {
      res = await clinicalService.escalateReview(id, data.reason as string);
    }
    if (res && !res.error) {
      toast({ title: "Success", description: "Review processed." });
      get().fetchReviews();
    }
  },

  setLayoutDensity: (v) => set({ layoutDensity: v }),
}));
