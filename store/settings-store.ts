import { create } from "zustand";
import { settingsService, AppSettings, SubscriptionPlan, QuotaDefaults, QuotaOverview, DeviceFingerprintResponse } from "@/lib/api/settings";
import { toast } from "@/components/ui/use-toast";

interface SettingsState {
  settings: AppSettings | null;
  plans: SubscriptionPlan[];
  quotaDefaults: QuotaDefaults | null;
  quotaOverview: QuotaOverview | null;
  deviceFingerprints: DeviceFingerprintResponse | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (section: keyof AppSettings, data: unknown) => Promise<void>;
  fetchPlans: () => Promise<void>;
  updatePlan: (id: string, data: Partial<SubscriptionPlan> & { daily_activity_limit?: number | null; ai_message_limit?: number | null }) => Promise<void>;
  createPlan: (data: Omit<SubscriptionPlan, 'id'> & { daily_activity_limit?: number | null; ai_message_limit?: number | null }) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  fetchQuotaDefaults: () => Promise<void>;
  updateQuotaDefaults: (payload: QuotaDefaults) => Promise<void>;
  fetchQuotaOverview: () => Promise<void>;
  fetchDeviceFingerprints: () => Promise<void>;
}

function normalizeSettings(data: Record<string, unknown>): AppSettings {
  return {
    general: {
      siteName: '',
      supportEmail: '',
      maintenanceMode: false,
      baseCurrency: 'NGN',
      ...((data.general as object) ?? {}),
    },
    ai: {
      openaiKey: '',
      anthropicKey: '',
      model: 'gpt-4o',
      temperature: 0.7,
      isLive: false,
      ...((data.ai as object) ?? {}),
    },
    features: {
      eprescriptions: false,
      secure_documents: false,
      ai_chat: true,
      video_calls: true,
      gamification: true,
      ...((data.features as object) ?? {}),
    },
    security: {
      passwordPolicy: 'medium',
      mfaEnabled: false,
      sessionTimeout: 60,
      ...((data.security as object) ?? {}),
    },
    env: {
      paystackPublicKey: '',
      paystackSecretKey: '',
      flutterwavePublicKey: '',
      flutterwaveSecretKey: '',
      stripePublicKey: '',
      stripeSecretKey: '',
      klumpPublicKey: '',
      klumpSecretKey: '',
      sentryDsn: '',
      ...((data.env as object) ?? {}),
    },
    ...(data.navigation  ? { navigation:  data.navigation  as AppSettings['navigation']  } : {}),
    ...(data.financial   ? { financial:   data.financial   as AppSettings['financial']   } : {}),
    ...(data.currency    ? { currency:    data.currency    as AppSettings['currency']    } : {}),
    ...(data.branding    ? { branding:    data.branding    as AppSettings['branding']    } : {}),
    ...(data.mail        ? { mail:        data.mail        as AppSettings['mail']        } : {}),
    ...(data.gateways    ? { gateways:    data.gateways    as AppSettings['gateways']    } : {}),
  };
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  plans: [],
  quotaDefaults: null,
  quotaOverview: null,
  deviceFingerprints: null,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await settingsService.getSettings();
      set({ settings: normalizeSettings(data ?? {}) });
    } catch (error) {
      console.error("Failed to fetch settings", error);
      set({ settings: normalizeSettings({}) });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (section, data) => {
    set({ isLoading: true });
    try {
      await settingsService.updateSettings(section, data);
      set((state) => ({
        settings: state.settings ? { ...state.settings, [section]: data } : null
      }));
      toast({ title: "Settings Updated", description: `${section} settings have been saved.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlans: async () => {
    try {
      const data = await settingsService.getSubscriptionPlans();
      set({ plans: data });
    } catch (error) {
      console.error("Failed to fetch plans", error);
      set({ plans: [] });
    }
  },

  updatePlan: async (id, data) => {
    set({ isLoading: true });
    try {
      await settingsService.updateSubscriptionPlan(id, data);
      set((state) => ({
        plans: state.plans.map(p => p.id === id ? { ...p, ...data } : p)
      }));
      toast({ title: "Plan Updated", description: "Subscription plan changes saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update plan.", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlan: async (data) => {
    set({ isLoading: true });
    try {
      const newPlan = await settingsService.createSubscriptionPlan(data);
      if (newPlan) {
        set((state) => ({
          plans: [...state.plans, newPlan]
        }));
        toast({ title: "Plan Created", description: "New subscription plan added." });
      }
    } catch (error) {
      console.error("Failed to create plan", error);
      toast({ title: "Error", description: "Failed to create plan.", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlan: async (id) => {
    set({ isLoading: true });
    try {
      await settingsService.deleteSubscriptionPlan(id);
      set((state) => ({
        plans: state.plans.filter(p => p.id !== id)
      }));
      toast({ title: "Plan Deleted", description: "Subscription plan removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete plan.", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchQuotaDefaults: async () => {
    try {
      const data = await settingsService.getQuotaDefaults();
      set({ quotaDefaults: data });
    } catch (error) {
      console.error("Failed to fetch quota defaults", error);
      set({ quotaDefaults: null });
    }
  },

  updateQuotaDefaults: async (payload) => {
    set({ isLoading: true });
    try {
      const updated = await settingsService.updateQuotaDefaults(payload);
      set({ quotaDefaults: updated });
      toast({ title: "Quotas Updated", description: "Global quota defaults have been saved." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update quotas.", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchQuotaOverview: async () => {
    try {
      const overview = await settingsService.getQuotaOverview();
      set({ quotaOverview: overview });
    } catch (error) {
      console.error("Failed to fetch quota overview", error);
      set({ quotaOverview: null });
    }
  },

  fetchDeviceFingerprints: async () => {
    try {
      const data = await settingsService.getDeviceFingerprints();
      set({ deviceFingerprints: data });
    } catch (error) {
      console.error("Failed to fetch device fingerprints", error);
      set({ deviceFingerprints: null });
    }
  }
}));
