
// filepath: lib/api/admin.ts
import client from "./client";
import { safeApiCall } from "./safeApiCall";

interface SupportStatsFallback {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  unavailable: true;
}

export const adminService = {
  async getStats() {
    return safeApiCall(() => client.get("/api/v1/admin/stats"));
  },

  async getRevenueFlow(period: string = "monthly") {
    return safeApiCall(() => client.get("/api/v1/admin/revenue-flow", { params: { period } }));
  },

  async getAICostSummary(period: string = "30d") {
    return safeApiCall(() => client.get("/api/v1/admin/analytics/ai-cost", { params: { period }, suppressErrorToast: true }));
  },

  async getDeals() {
    return safeApiCall(() => client.get("/api/v1/admin/deals"));
  },

  async getActiveUsers() {
    return safeApiCall(() => client.get("/api/v1/admin/active-users"));
  },

  async getQuotaOverview() {
    // Corrected endpoint based on audit
    return safeApiCall(() => client.get("/api/v1/admin/quota/overview"));
  },

  async getTherapists(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists", { params }));
  },

  async getTherapist(id: string) {
    return safeApiCall(() => client.get(`/api/v1/admin/therapists/${id}`));
  },

  async getTherapistCounts() {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/counts"));
  },

  async getPendingTherapists(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/pending", { params }));
  },

  async approveTherapist(therapistId: string, notes?: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/approve`, { notes }));
  },

  async rejectTherapist(therapistId: string, reason: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/reject`, { reason }));
  },

  async activateTherapist(therapistId: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/activate`));
  },

  async deactivateTherapist(therapistId: string | number, reason?: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/deactivate`, { reason }));
  },

  async setTherapistHomepageFeatured(
    therapistId: string | number,
    enabled: boolean,
    durationHours = 3,
  ) {
    return safeApiCall(() =>
      client.post(`/api/v1/admin/therapists/${therapistId}/homepage-featured`, {
        enabled,
        duration_hours: durationHours,
      }),
    );
  },

  async viewTherapistDocument(therapistId: string | number, type: "certificate") {
    const response = await client.get(`/api/v1/admin/therapists/${therapistId}/documents/${type}`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  async inviteTherapist(email: string, notes?: string) {
    return safeApiCall(() => client.post("/api/v1/admin/therapists/invite", { email, notes }));
  },

  async getTherapistInvites() {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/invites"));
  },

  async revokeTherapistInvite(inviteId: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/therapists/invites/${inviteId}`));
  },

  async getUsers(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/users", { params }));
  },

  async getSettings() {
    return safeApiCall(() => client.get("/api/v1/admin/settings"));
  },

  async getSupportTickets(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/support/tickets", { params }));
  },

  async getSupportStats() {
    // TODO: switch to backend endpoint once available: GET /api/v1/admin/support/stats
    console.warn("Support stats endpoint unavailable. Returning fallback stats.");
    const fallback: SupportStatsFallback = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      unavailable: true,
    };
    return fallback;
  },
};
