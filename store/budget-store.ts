import { create } from "zustand";
import client from "@/lib/api/client";

export type BudgetStatus =
  | "draft"
  | "pending_coo"
  | "pending_ceo"
  | "queried"
  | "pending_finance"
  | "approved"
  | "rejected";

export interface BudgetRequest {
  id: number;
  department: string;
  category: string;
  title: string;
  description?: string;
  amount_requested: number;
  currency: string;
  period: string;
  status: BudgetStatus;
  submitted_by: number;
  submitted_at?: string;
  coo_notes?: string;
  ceo_notes?: string;
  finance_notes?: string;
  rejection_reason?: string;
  rejected_at?: string;
  ceo_query_notes?: string;
  ceo_suggested_amount?: number | null;
  creator_response?: string | null;
  creator_responded_at?: string | null;
  submittedBy?: { id: number; first_name: string; last_name: string };
  approvedByCoo?: { id: number; first_name: string; last_name: string } | null;
  approvedByCeo?: { id: number; first_name: string; last_name: string } | null;
  approvedByFinance?: { id: number; first_name: string; last_name: string } | null;
  rejectedBy?: { id: number; first_name: string; last_name: string } | null;
  created_at: string;
  updated_at: string;
}

interface BudgetState {
  budgets: BudgetRequest[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;

  fetchBudgets: (params?: { status?: BudgetStatus; page?: number }) => Promise<void>;
  createBudget: (payload: Omit<BudgetRequest, "id" | "status" | "submitted_by" | "created_at" | "updated_at">) => Promise<BudgetRequest>;
  updateBudget: (id: number, payload: Partial<BudgetRequest>) => Promise<BudgetRequest>;
  deleteBudget: (id: number) => Promise<void>;
  submitBudget: (id: number) => Promise<void>;
  approveCoo: (id: number, notes?: string) => Promise<void>;
  approveCeo: (id: number, notes?: string) => Promise<void>;
  approveFinance: (id: number, notes?: string) => Promise<void>;
  rejectBudget: (id: number, reason: string) => Promise<void>;
  queryCeo: (id: number, queryNotes: string, suggestedAmount?: number) => Promise<void>;
  respondToQuery: (id: number, response: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchBudgets: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/budgets", { params });
      const d = res.data;
      set({
        budgets: d.data ?? d,
        total: d.total ?? (d.data ?? d).length,
        page: d.current_page ?? 1,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load budgets";
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  createBudget: async (payload) => {
    const res = await client.post("/api/v1/budgets", payload);
    const budget: BudgetRequest = res.data;
    set((s) => ({ budgets: [budget, ...s.budgets] }));
    return budget;
  },

  updateBudget: async (id, payload) => {
    const res = await client.put(`/api/v1/budgets/${id}`, payload);
    const updated: BudgetRequest = res.data;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
    return updated;
  },

  deleteBudget: async (id) => {
    await client.delete(`/api/v1/budgets/${id}`);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  submitBudget: async (id) => {
    const res = await client.post(`/api/v1/budgets/${id}/submit`);
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  approveCoo: async (id, notes) => {
    const res = await client.post(`/api/v1/budgets/${id}/approve/coo`, { notes });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  approveCeo: async (id, notes) => {
    const res = await client.post(`/api/v1/budgets/${id}/approve/ceo`, { notes });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  approveFinance: async (id, notes) => {
    const res = await client.post(`/api/v1/budgets/${id}/approve/finance`, { notes });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  rejectBudget: async (id, reason) => {
    const res = await client.post(`/api/v1/budgets/${id}/reject`, { reason });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  queryCeo: async (id, queryNotes, suggestedAmount) => {
    const res = await client.post(`/api/v1/budgets/${id}/query/ceo`, {
      query_notes: queryNotes,
      ...(suggestedAmount !== undefined && { suggested_amount: suggestedAmount }),
    });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },

  respondToQuery: async (id, response) => {
    const res = await client.post(`/api/v1/budgets/${id}/respond`, { response });
    const updated: BudgetRequest = res.data.budget;
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? updated : b)) }));
  },
}));
