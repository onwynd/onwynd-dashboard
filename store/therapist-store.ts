
// filepath: store/therapist-store.ts
import { create } from "zustand";
import { therapistService, TherapistStat, FinancialFlowEntry, TherapistProfile } from "@/lib/api/therapist";

export type LayoutDensity = "comfortable" | "compact" | "default";

interface TherapistState {
  stats: TherapistStat[];
  financialFlow: FinancialFlowEntry[];
  profile: TherapistProfile | null;
  loadingStats: boolean;
  loadingFinancialFlow: boolean;
  loadingProfile: boolean;
  error: string | null;
  
  layoutDensity: LayoutDensity;
  
  fetchDashboardData: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  completeOnboardingStep: (step: string) => Promise<void>;

  setLayoutDensity: (v: LayoutDensity) => void;
}

export const useTherapistStore = create<TherapistState>((set, get) => ({
  stats: [],
  financialFlow: [],
  profile: null,
  loadingStats: true,
  loadingFinancialFlow: true,
  loadingProfile: true,
  error: null,
  layoutDensity: "comfortable",

  fetchDashboardData: async () => {
    set({ loadingStats: true, loadingFinancialFlow: true });
    const [statsRes, flowRes] = await Promise.all([
        therapistService.getStats(),
        therapistService.getFinancialFlow()
    ]);
    
    if (statsRes.data) {
        set({ stats: statsRes.data, loadingStats: false });
    } else {
        set({ loadingStats: false, error: statsRes.error });
    }

    if (flowRes.data) {
        set({ financialFlow: flowRes.data, loadingFinancialFlow: false });
    } else {
        set({ loadingFinancialFlow: false, error: flowRes.error });
    }
  },

  fetchProfile: async () => {
    set({ loadingProfile: true });
    const { data, error } = await therapistService.getProfile();
    if (data) {
      set({ profile: data, loadingProfile: false });
    } else {
      set({ loadingProfile: false, error: error });
    }
  },

  acceptTerms: async () => {
    const { data, error } = await therapistService.acceptTerms();
    if (data) {
      set((state) => ({
        profile: state.profile ? { ...state.profile, terms_accepted_at: new Date().toISOString() } : null,
      }));
    }
  },

  completeOnboardingStep: async (step: string) => {
      const { data, error } = await therapistService.updateOnboardingStep(step);
      if(data) {
          set(state => ({
              profile: state.profile ? { ...state.profile, onboarding_steps_completed: [...(state.profile.onboarding_steps_completed || []), step] } : null
          }))
      }
  },
  
  setLayoutDensity: (v) => set({ layoutDensity: v }),
}));
