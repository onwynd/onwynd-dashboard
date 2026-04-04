import { create } from "zustand";
import client from "@/lib/api/client";

interface VpProductState {
  isLoading: boolean;
  error: string | null;
  featuresShippedMtd: number | null;
  inDevelopment: number | null;
  backlogItems: number | null;
  bugCount: number | null;
  deployFrequency: number | null;
  systemUptimePct: number | null;
  roadmapInitiatives: { name: string; progress: number; status: "on_track" | "at_risk" | "off_track" | "done" }[];
  recentDeployments: {
    id: number | string;
    version: string;
    date: string;
    environment: string;
    status: "success" | "failed" | "rollback";
  }[];
  techHealth: {
    api_error_rate?: number;
    avg_response_ms?: number;
    uptime_pct?: number;
    active_incidents?: number;
  };
  fetchAll: () => Promise<void>;
}

export const useVpProductStore = create<VpProductState>((set) => ({
  isLoading: false,
  error: null,
  featuresShippedMtd: null,
  inDevelopment: null,
  backlogItems: null,
  bugCount: null,
  deployFrequency: null,
  systemUptimePct: null,
  roadmapInitiatives: [],
  recentDeployments: [],
  techHealth: {},

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/product/dashboard");
      const d = res.data?.data ?? res.data ?? {};
      set({
        featuresShippedMtd: d.features_shipped_mtd ?? null,
        inDevelopment: d.in_development ?? null,
        backlogItems: d.backlog_items ?? null,
        bugCount: d.bug_count ?? null,
        deployFrequency: d.deploy_frequency_per_week ?? null,
        systemUptimePct: d.system_uptime_pct ?? null,
        roadmapInitiatives: Array.isArray(d.roadmap_initiatives) ? d.roadmap_initiatives : [],
        recentDeployments: Array.isArray(d.recent_deployments) ? d.recent_deployments : [],
        techHealth: d.tech_health ?? {},
      });
    } catch {
      set({ error: "Failed to load product data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
