import { create } from "zustand";
import { therapistService } from "@/lib/api/therapist";

export interface TherapistStat {
  title: string;
  value: string;
  subtitle: string;
  iconName?: string;
}

export interface Patient {
  id: number;
  uuid: string;
  first_name: string;   // mapped from display_name by the backend resource
  display_name: string;
  last_name: string | null;
  email: string | null; // null when patient has not consented to identity sharing
  email_protected: boolean;
  role_id?: number;
  is_active?: boolean;
  department?: string;
  created_at: string;
  profile_photo: string | null;
  avatar_url?: string | null;
  status?: string;
  identity_shared?: boolean;
}

const initialStats: TherapistStat[] = [
  {
    title: "Total Patients",
    value: "0",
    subtitle: "Loading...",
    iconName: "users"
  },
  {
    title: "Upcoming Sessions",
    value: "0",
    subtitle: "Loading...",
    iconName: "file-text"
  },
  {
    title: "Attendance Rate",
    value: "0%",
    subtitle: "Loading...",
    iconName: "calendar"
  },
];

export interface FinancialFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange: number;
  moneyOutChange: number;
}

export type LayoutDensity = "default" | "compact" | "comfortable";

interface TherapistState {
  stats: TherapistStat[];
  patients: Patient[];
  financialFlow: FinancialFlowData[];
  notes: Array<{
    id: number | string;
    clientId?: string | number;
    clientName?: string;
    sessionId?: string | number;
    category?: string;
    content?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
  }>;
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  layoutDensity: LayoutDensity;
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  consentRequired: boolean;
  consentMessage?: string;
  isLoadingPatients: boolean;

  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  clearFilters: () => void;
  
  setLayoutDensity: (density: LayoutDensity) => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  resetLayout: () => void;
  setConsentRequired: (required: boolean, message?: string) => void;
  clearConsentRequired: () => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchPatients: (params?: Record<string, unknown>) => Promise<void>;
  fetchFinancialFlow: (period: string) => Promise<void>;
  fetchNotes: (params?: Record<string, unknown>) => Promise<void>;
  createNote: (data: Record<string, unknown>) => Promise<void>;
  updateNote: (id: number | string, data: Record<string, unknown>) => Promise<void>;
  deleteNote: (id: number | string) => Promise<void>;
}

export const useTherapistStore = create<TherapistState>((set) => ({
  stats: initialStats,
  patients: [],
  financialFlow: [],
  notes: [],
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  consentRequired: false,
  consentMessage: undefined,
  isLoadingPatients: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (filter) => set({ departmentFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearFilters: () =>
    set({
      searchQuery: "",
      departmentFilter: "all",
      statusFilter: "all",
    }),

  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  resetLayout: () =>
    set({
      showAlertBanner: true,
      showStatsCards: true,
      showChart: true,
      showTable: true,
      layoutDensity: "default",
    }),
  setConsentRequired: (required, message) =>
    set({
      consentRequired: required,
      consentMessage: message,
    }),
  clearConsentRequired: () =>
    set({
      consentRequired: false,
      consentMessage: undefined,
    }),

  fetchStats: async () => {
    try {
      const data = await therapistService.getStats();
      set({ stats: data as TherapistStat[] || undefined });
    } catch {
      // network/server error — silently ignore, stats stay undefined
    }
  },

  fetchPatients: async (params) => {
    set({ isLoadingPatients: true });
    try {
      const data = await therapistService.getPatients(params);
      // Backend returns a paginated object { data: Patient[], ... } or a plain array
      const items: Patient[] = Array.isArray(data)
        ? (data as Patient[])
        : ((data as { data?: Patient[] })?.data ?? []);
      set({ patients: items, isLoadingPatients: false });
    } catch {
      set({ isLoadingPatients: false });
    }
  },

  fetchFinancialFlow: async (period) => {
    try {
      const data = await therapistService.getFinancialFlow(period);
      set({ financialFlow: data as FinancialFlowData[] || [] });
    } catch {
      set({ financialFlow: [] });
    }
  },

  fetchNotes: async (params) => {
    try {
      const data = await therapistService.getNotes(params);
      const notesData = data as TherapistState['notes'] | { data?: TherapistState['notes'] };
      const rows = Array.isArray(notesData) ? notesData : Array.isArray((notesData as { data?: TherapistState['notes'] })?.data) ? (notesData as { data: TherapistState['notes'] }).data : [];
      set({ notes: rows });
    } catch {
      set({ notes: [] });
    }
  },

  createNote: async (payload) => {
    try {
      const created = await therapistService.createNote(payload);
      const note = (created as any)?.data ?? created;
      set((state) => ({ notes: note ? [...state.notes, note as TherapistState['notes'][0]] : state.notes }));
    } catch (error) {
      console.error("Failed to create therapist note:", error);
    }
  },

  updateNote: async (id, payload) => {
    try {
      const updated = await therapistService.updateNote(id, payload);
      const noteData = updated as { data?: TherapistState['notes'][0] } | TherapistState['notes'][0];
      const note = (noteData as any)?.data ?? noteData;
      set((state) => ({
        notes: state.notes.map((n) => (String(n.id) === String(id) ? { ...n, ...(note as Partial<TherapistState['notes'][0]>) } : n)),
      }));
    } catch (error) {
      console.error("Failed to update therapist note:", error);
    }
  },

  deleteNote: async (id) => {
    try {
      await therapistService.deleteNote(id);
      set((state) => ({ notes: state.notes.filter((n) => String(n.id) !== String(id)) }));
    } catch (error) {
      console.error("Failed to delete therapist note:", error);
    }
  },
}));
