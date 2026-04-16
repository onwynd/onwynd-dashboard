
// filepath: lib/api/sales.ts
import client from "./client";
import { safeApiCall } from "./safeApiCall";

export interface Deal {
  id: string;
  name: string;
  stage: "new" | "contacted" | "demo" | "won" | "lost";
  value: number;
  stale_at: string;
  created_at: string;
}

export interface Organization {
    id: number;
    name: string;
    members_count: number;
    renewal_date: string;
    contacts: { name: string; email: string }[];
}

export const salesService = {
  // Closer-specific endpoints
  async getCloserDashboard() {
    return safeApiCall(() => client.get("/api/v1/sales/closer/dashboard"));
  },

  async getDashboard() {
    return safeApiCall(() => client.get("/api/v1/sales/closer/dashboard"));
  },

  async getDeals(params?: { status?: string }) {
    const query =
      params?.status === "closed_won" || params?.status === "closed_lost"
        ? { stage: params.status }
        : params;
    return safeApiCall(() => client.get("/api/v1/sales/deals", { params: query }));
  },

  async getClosedDeals() {
    return safeApiCall(() =>
      client.get("/api/v1/sales/deals", {
        params: { stage: "closed_won,closed_lost" },
      })
    );
  },

  async markDealWon(id: string) {
    return safeApiCall(() => client.post(`/api/v1/sales/closer/deals/${id}/mark-won`));
  },

  async markDealLost(id: string, reason: string) {
    const normalizedReason = ["budget", "competitor", "timing", "no_decision", "other"].includes(reason)
      ? reason
      : "other";
    return safeApiCall(() =>
      client.post(`/api/v1/sales/closer/deals/${id}/mark-lost`, { lost_reason: normalizedReason })
    );
  },

  // Builder-specific endpoints
  async getManagedOrganizations() {
    return safeApiCall(() => client.get("/api/v1/sales/builder/organizations"));
  },

  // Stats / Revenue / Leads
  async getStats() {
    return safeApiCall(() => client.get("/api/v1/sales/stats"));
  },

  async getRevenueFlow(period?: string) {
    return safeApiCall(() => client.get("/api/v1/sales/revenue-flow", { params: { period } }));
  },

  async getLeadSources(period?: string) {
    return safeApiCall(() => client.get("/api/v1/sales/lead-sources", { params: { period } }));
  },

  async getLeads(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/leads", { params }));
  },

  async updateLead(id: number | string, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/sales/leads/${id}`, data));
  },

  async deleteLead(id: number | string) {
    return safeApiCall(() => client.delete(`/api/v1/sales/leads/${id}`));
  },

  // Contacts
  async getContacts(params?: { search?: string }) {
    return safeApiCall(() => client.get("/api/v1/sales/contacts", { params }));
  },

  async createContact(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/sales/contacts", data));
  },

  async deleteContact(id: number) {
    return safeApiCall(() => client.delete(`/api/v1/sales/contacts/${id}`));
  },

  // Tasks
  async getTasks(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/sales/tasks", { params }));
  },

  async createTask(data: { title: string; due_date?: string; priority?: string }) {
    return safeApiCall(() => client.post("/api/v1/sales/tasks", data));
  },

  async updateTask(id: number | string, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/sales/tasks/${id}`, data));
  },

  async deleteTask(id: number | string) {
    return safeApiCall(() => client.delete(`/api/v1/sales/tasks/${id}`));
  },
};
