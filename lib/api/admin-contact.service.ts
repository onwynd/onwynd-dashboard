import client from "./client";

export interface ContactSubmission {
  id: number;
  ticket_id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: "general" | "support" | "partnerships" | "press" | "other";
  message: string;
  status: "new" | "open" | "replied" | "resolved" | "spam";
  internal_notes: string | null;
  assigned_to: number | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  assignedTo?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ContactStats {
  total: number;
  new: number;
  open: number;
  replied: number;
  resolved: number;
  spam: number;
}

export interface ContactFilters {
  status?: ContactSubmission["status"] | "all";
  subject?: ContactSubmission["subject"] | "all";
  search?: string;
  page?: number;
  per_page?: number;
}

const BASE = "/api/v1/admin/contact-submissions";

export const adminContactService = {
  async getSubmissions(filters: ContactFilters = {}): Promise<{
    submissions: ContactSubmission[];
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
    stats: ContactStats;
  }> {
    const params: Record<string, string | number> = {};
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.subject && filters.subject !== "all") params.subject = filters.subject;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    const res = await client.get(BASE, { params });
    return res.data.data ?? res.data;
  },

  async getSubmission(id: number): Promise<ContactSubmission> {
    const res = await client.get(`${BASE}/${id}`);
    const d = res.data.data ?? res.data;
    return d.submission ?? d;
  },

  async updateStatus(
    id: number,
    status: ContactSubmission["status"]
  ): Promise<ContactSubmission> {
    const res = await client.patch(`${BASE}/${id}/status`, { status });
    const d = res.data.data ?? res.data;
    return d.submission ?? d;
  },

  async addNote(id: number, note: string): Promise<ContactSubmission> {
    const res = await client.post(`${BASE}/${id}/notes`, { note });
    const d = res.data.data ?? res.data;
    return d.submission ?? d;
  },

  async deleteSubmission(id: number): Promise<void> {
    await client.delete(`${BASE}/${id}`);
  },
};
