import { create } from "zustand";
import client from "@/lib/api/client";

interface VpMarketingState {
  isLoading: boolean;
  error: string | null;
  activeCampaigns: number | null;
  newLeadsMtd: number | null;
  emailOpenRate: number | null;
  subscriberGrowth: number | null;
  cac: number | null;
  contentPublished: number | null;
  campaignPerformance: { name: string; sent: number; opened: number; clicked: number }[];
  topChannels: { channel: string; leads: number; conversion_rate: number }[];
  fetchAll: () => Promise<void>;
}

export const useVpMarketingStore = create<VpMarketingState>((set) => ({
  isLoading: false,
  error: null,
  activeCampaigns: null,
  newLeadsMtd: null,
  emailOpenRate: null,
  subscriberGrowth: null,
  cac: null,
  contentPublished: null,
  campaignPerformance: [],
  topChannels: [],

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/marketing/dashboard");
      const d = res.data?.data ?? res.data ?? {};
      set({
        activeCampaigns: d.active_campaigns ?? null,
        newLeadsMtd: d.new_leads_mtd ?? null,
        emailOpenRate: d.email_open_rate ?? null,
        subscriberGrowth: d.subscriber_growth ?? null,
        cac: d.cac ?? null,
        contentPublished: d.content_published ?? null,
        campaignPerformance: Array.isArray(d.campaign_performance) ? d.campaign_performance : [],
        topChannels: Array.isArray(d.top_channels) ? d.top_channels : [],
      });
    } catch {
      set({ error: "Failed to load marketing data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
