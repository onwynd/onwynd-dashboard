import { create } from "zustand";
import client from "@/lib/api/client";

export type ApprovalStatus =
  | "pending" | "under_review" | "approved" | "rejected" | "cancelled" | "escalated";

export type ApprovalType =
  | "leave" | "budget" | "promotion" | "transfer" | "termination" | "expense" | "custom";

export interface ApprovalStep {
  id: number;
  step_number: number;
  step_label: string;
  approver_role: string | null;
  approver_id: number | null;
  approver?: { id: number; first_name: string; last_name: string } | null;
  status: "pending" | "approved" | "rejected" | "under_review" | "skipped" | "escalated";
  action_notes?: string | null;
  submitter_response?: string | null;
  actioned_at?: string | null;
  actioned_by?: number | null;
  due_at?: string | null;
}

export interface ApprovalRequest {
  id: number;
  uuid: string;
  type: ApprovalType;
  title: string;
  description?: string;
  status: ApprovalStatus;
  current_step: number;
  total_steps: number;
  metadata?: Record<string, unknown>;
  requested_by: number;
  requester?: { id: number; first_name: string; last_name: string; email: string };
  steps: ApprovalStep[];
  resolved_at?: string | null;
  created_at: string;
}

interface ApprovalState {
  requests: ApprovalRequest[];
  inbox: ApprovalStep[];
  isLoading: boolean;
  inboxLoading: boolean;
  error: string | null;
  total: number;

  fetchRequests: (params?: { type?: ApprovalType; status?: ApprovalStatus }) => Promise<void>;
  fetchInbox: () => Promise<void>;
  initiate: (payload: {
    type: ApprovalType;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    subject_type?: string;
    subject_id?: number;
    custom_steps?: { label: string; approver_id: number }[];
  }) => Promise<ApprovalRequest>;
  approve: (uuid: string, notes?: string) => Promise<ApprovalRequest>;
  reject: (uuid: string, reason: string) => Promise<ApprovalRequest>;
  requestReview: (uuid: string, questions: string) => Promise<ApprovalRequest>;
  respond: (uuid: string, response: string) => Promise<ApprovalRequest>;
  cancel: (uuid: string) => Promise<void>;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  requests: [],
  inbox: [],
  isLoading: false,
  inboxLoading: false,
  error: null,
  total: 0,

  fetchRequests: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/approvals", { params });
      const d = res.data;
      set({ requests: d.data ?? d, total: d.total ?? (d.data ?? d).length });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Failed to load approval requests" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInbox: async () => {
    set({ inboxLoading: true });
    try {
      const res = await client.get("/api/v1/approvals/inbox");
      set({ inbox: res.data ?? [] });
    } finally {
      set({ inboxLoading: false });
    }
  },

  initiate: async (payload) => {
    const res = await client.post("/api/v1/approvals", payload);
    const req: ApprovalRequest = res.data;
    set((s) => ({ requests: [req, ...s.requests] }));
    return req;
  },

  approve: async (uuid, notes) => {
    const res = await client.post(`/api/v1/approvals/${uuid}/approve`, { notes });
    const updated: ApprovalRequest = res.data;
    set((s) => ({ requests: s.requests.map((r) => (r.uuid === uuid ? updated : r)) }));
    return updated;
  },

  reject: async (uuid, reason) => {
    const res = await client.post(`/api/v1/approvals/${uuid}/reject`, { reason });
    const updated: ApprovalRequest = res.data;
    set((s) => ({ requests: s.requests.map((r) => (r.uuid === uuid ? updated : r)) }));
    return updated;
  },

  requestReview: async (uuid, questions) => {
    const res = await client.post(`/api/v1/approvals/${uuid}/review`, { questions });
    const updated: ApprovalRequest = res.data;
    set((s) => ({ requests: s.requests.map((r) => (r.uuid === uuid ? updated : r)) }));
    return updated;
  },

  respond: async (uuid, response) => {
    const res = await client.post(`/api/v1/approvals/${uuid}/respond`, { response });
    const updated: ApprovalRequest = res.data;
    set((s) => ({ requests: s.requests.map((r) => (r.uuid === uuid ? updated : r)) }));
    return updated;
  },

  cancel: async (uuid) => {
    await client.post(`/api/v1/approvals/${uuid}/cancel`);
    set((s) => ({
      requests: s.requests.map((r) =>
        r.uuid === uuid ? { ...r, status: "cancelled" } : r
      ),
    }));
  },
}));
