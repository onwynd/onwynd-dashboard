
// filepath: lib/api/finder.ts
import client from "./client";
import { safeApiCall } from "./safeApiCall";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "unqualified";
  created_at: string;
}

export interface FinderStats {
  leads_generated: number;
  conversion_rate: number;
  earnings: number;
}

export const finderService = {
  async getLeads(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/finder/leads", { params }));
  },

  async getLead(id: string) {
    return safeApiCall(() => client.get(`/api/v1/finder/leads/${id}`));
  },

  async createLead(data: Partial<Lead>) {
    return safeApiCall(() => client.post("/api/v1/finder/leads", data));
  },

  async updateLead(id: string, data: Partial<Lead>) {
    return safeApiCall(() => client.put(`/api/v1/finder/leads/${id}`, data));
  },

  async deleteLead(id: string) {
    return safeApiCall(() => client.delete(`/api/v1/finder/leads/${id}`));
  },

  async getStats() {
    return safeApiCall(() => client.get("/api/v1/finder/stats"));
  },

  async getConversions(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/deals", { params: { ...params, stage: "closed_won" } }));
  },

  async getPerformance(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/stats", { params }));
  },

  async getCalls(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/tasks", { params }));
  },

  async getEmails(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/notifications", { params }));
  },

  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    from_name?: string;
    from_email?: string;
    reply_to?: string;
    provider_hint?: string;
  }) {
    return safeApiCall(() => client.post("/api/v1/finder/mail/send", data));
  },

  async getAnalytics(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/finder/analytics", { params }));
  },

  async getNotifications(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/finder/notifications", { params }));
  },
};
