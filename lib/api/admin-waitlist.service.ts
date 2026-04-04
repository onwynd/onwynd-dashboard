import client from "./client";

export interface WaitlistEntry {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "patient" | "therapist" | "institution" | "other";
  country: string | null;
  referral_source: string | null;
  message: string | null;
  status: "pending" | "invited" | "declined";
  invited_at: string | null;
  created_at: string;
  updated_at: string;
  // Therapist fields
  years_of_experience: number | null;
  specialty: string | null;
  // Institution fields
  institution_type: "company" | "university" | "hospital" | "ngo" | null;
  organization_name: string | null;
  company_size: string | null;
}

export interface WaitlistStats {
  total: number;
  pending: number;
  invited: number;
  declined: number;
  conversion_rate: number;
  by_role: Record<string, number>;
  by_country: Record<string, number>;
  by_referral: Record<string, number>;
  oldest_pending: string | null;
}

export interface WaitlistFilters {
  search?: string;
  status?: WaitlistEntry["status"] | "all";
  role?: WaitlistEntry["role"] | "all";
  country?: string;
  page?: number;
  per_page?: number;
}

const BASE = "/api/v1/admin/waitlist";

export const adminWaitlistService = {
  async getWaitlist(filters: WaitlistFilters = {}): Promise<{
    submissions: { data: WaitlistEntry[]; total: number; per_page: number; current_page: number; last_page: number };
    stats: WaitlistStats;
  }> {
    const params: Record<string, string | number> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.role && filters.role !== "all") params.role = filters.role;
    if (filters.country) params.country = filters.country;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    const res = await client.get(BASE, { params });
    return res.data.data ?? res.data;
  },

  async invite(id: number): Promise<WaitlistEntry> {
    const res = await client.patch(`${BASE}/${id}/invite`);
    return res.data.data ?? res.data;
  },

  async batchInvite(ids: number[]): Promise<{ invited: number }> {
    const res = await client.post(`${BASE}/batch-invite`, { ids });
    return res.data.data ?? res.data;
  },

  async updateStatus(id: number, status: WaitlistEntry["status"]): Promise<WaitlistEntry> {
    const res = await client.patch(`${BASE}/${id}/status`, { status });
    return res.data.data ?? res.data;
  },

  async destroy(id: number): Promise<void> {
    await client.delete(`${BASE}/${id}`);
  },

  exportUrl(): string {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${base}${BASE}/export${token ? `?token=${token}` : ""}`;
  },
};
