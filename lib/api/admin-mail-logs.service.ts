import client from "./client";

export interface MailLogEntry {
  id: number;
  mailable_class: string | null;
  mailable_name: string;   // short name accessor from backend
  recipient: string;
  subject: string | null;
  status: "sent" | "failed";
  failure_reason: string | null;
  metadata: Record<string, string> | null;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export interface MailLogStats {
  total: number;
  sent: number;
  failed: number;
  sent_24h: number;
  failed_24h: number;
}

export interface MailLogFilters {
  status?: "sent" | "failed" | "all";
  search?: string;
  page?: number;
  per_page?: number;
}

const BASE = "/api/v1/admin/mail-logs";

export const adminMailLogService = {
  async getLogs(filters: MailLogFilters = {}): Promise<{
    logs: MailLogEntry[];
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
    stats: MailLogStats;
  }> {
    const params: Record<string, string | number> = {};
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    const res = await client.get(BASE, { params });
    return res.data.data ?? res.data;
  },

  async deleteLog(id: number): Promise<void> {
    await client.delete(`${BASE}/${id}`);
  },

  async purge(olderThanDays: number): Promise<{ deleted: number }> {
    const res = await client.delete(BASE, { data: { older_than_days: olderThanDays } });
    return res.data.data ?? res.data;
  },
};
