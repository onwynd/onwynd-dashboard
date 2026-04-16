
// filepath: store/therapist-store.ts
import { create } from "zustand";
import { therapistService, TherapistStat, FinancialFlowEntry, TherapistProfile, Patient } from "@/lib/api/therapist";
export type { Patient };

export type LayoutDensity = "comfortable" | "compact" | "default";

export interface TherapistNote {
  id?: number | string;
  clientName?: string;
  category?: string;
  content?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface TherapistState {
  stats: TherapistStat[];
  financialFlow: FinancialFlowEntry[];
  profile: TherapistProfile | null;
  notes: TherapistNote[];
  loadingStats: boolean;
  loadingFinancialFlow: boolean;
  loadingProfile: boolean;
  error: string | null;

  layoutDensity: LayoutDensity;

  fetchDashboardData: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  completeOnboardingStep: (step: string) => Promise<void>;
  fetchNotes: () => Promise<void>;
  createNote: (data: Omit<TherapistNote, "id">) => Promise<void>;
  updateNote: (id: string | number, data: Partial<TherapistNote>) => Promise<void>;
  deleteNote: (id: string | number) => Promise<void>;
  setConsentRequired: (required: boolean, message?: string) => void;

  setLayoutDensity: (v: LayoutDensity) => void;
}

export const useTherapistStore = create<TherapistState>((set, get) => ({
  stats: [],
  financialFlow: [],
  profile: null,
  notes: [],
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
  
  fetchNotes: async () => {
    const { data } = await therapistService.getNotes();
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    set({ notes: list });
  },

  createNote: async (payload) => {
    const { data } = await therapistService.createNote(payload as Record<string, unknown>);
    if (data) {
      set((state) => ({ notes: [...state.notes, data?.data ?? data] }));
    }
  },

  updateNote: async (id, payload) => {
    const { data } = await therapistService.updateNote(id, payload as Record<string, unknown>);
    if (data) {
      const updated = data?.data ?? data;
      set((state) => ({
        notes: state.notes.map((n) => (String(n.id) === String(id) ? { ...n, ...updated } : n)),
      }));
    }
  },

  deleteNote: async (id) => {
    await therapistService.deleteNote(id);
    set((state) => ({ notes: state.notes.filter((n) => String(n.id) !== String(id)) }));
  },

  setConsentRequired: (_required, _message) => {
    // handled by UI layer — store stub for client.ts interceptor
  },

  setLayoutDensity: (v) => set({ layoutDensity: v }),
}));
