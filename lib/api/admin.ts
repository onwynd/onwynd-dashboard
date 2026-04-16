
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

  async getAnalyticsReports(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/revenue/analytics", { params }));
  },

  async getUserGrowthAnalytics(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/reports/user-growth", { params }));
  },

  async getUpgradeRequests(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/subscription-upgrade/requests", { params }));
  },

  async getUpgradeRequestStats(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/subscription-upgrade/requests/stats", { params }));
  },

  async getAuthSessions() {
    return safeApiCall(() => client.get("/api/v1/admin/auth-sessions"));
  },

  async revokeAuthSession(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/auth-sessions/${id}`));
  },

  async revokeUserSessions(userId: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/auth-sessions/user/${userId}`));
  },

  async approveUpgradeRequest(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/subscription-upgrade/requests/${id}/approve`));
  },

  async denyUpgradeRequest(id: string | number, reason?: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/subscription-upgrade/requests/${id}/deny`, { reason }));
  },

  // Careers & Job Applications
  async getCareers(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/careers", { params }));
  },

  async createCareer(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/careers", data));
  },

  async updateCareer(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/careers/${id}`, data));
  },

  async deleteCareer(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/careers/${id}`));
  },

  async toggleCareer(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/careers/${id}/toggle`));
  },

  async getJobApplications(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/careers/applications", { params }));
  },

  async getJobApplication(uuid: string) {
    return safeApiCall(() => client.get(`/api/v1/admin/careers/applications/${uuid}`));
  },

  async updateJobApplication(uuid: string, data: Record<string, unknown>) {
    return safeApiCall(() => client.patch(`/api/v1/admin/careers/applications/${uuid}`, data));
  },

  async deleteJobApplication(uuid: string) {
    return safeApiCall(() => client.delete(`/api/v1/admin/careers/applications/${uuid}`));
  },

  // Centers
  async getCenters(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/centers", { params }));
  },

  async getCenter(id: string | number) {
    return safeApiCall(() => client.get(`/api/v1/admin/centers/${id}`));
  },

  async createCenter(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/centers", data));
  },

  async updateCenter(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/centers/${id}`, data));
  },

  async deleteCenter(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/centers/${id}`));
  },

  // Courses
  async getCourses(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/courses", { params }));
  },

  async createCourse(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/courses", data));
  },

  async updateCourse(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/courses/${id}`, data));
  },

  async deleteCourse(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/courses/${id}`));
  },

  // Communities
  async getCommunities(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/communities", { params }));
  },

  async createCommunity(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/communities", data));
  },

  async updateCommunity(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/communities/${id}`, data));
  },

  async deleteCommunity(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/communities/${id}`));
  },

  // Resources
  async getResources(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/resources", { params }));
  },

  async createResource(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/resources", data));
  },

  async approveResource(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/resources/${id}/approve`));
  },

  async rejectResource(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/resources/${id}/reject`));
  },

  async deleteResource(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/resources/${id}`));
  },

  // Sounds
  async getSounds(category?: string) {
    return safeApiCall(() => client.get("/api/v1/admin/sounds", { params: category ? { category } : undefined }));
  },

  async uploadSound(file: File, category?: string) {
    const fd = new FormData();
    fd.append("file", file);
    if (category) fd.append("category", category);
    return safeApiCall(() => client.post("/api/v1/admin/sounds", fd, { headers: { "Content-Type": "multipart/form-data" } }));
  },

  async deleteSound(filename: string, category?: string) {
    return safeApiCall(() => client.delete(`/api/v1/admin/sounds/${encodeURIComponent(filename)}`, { params: category ? { category } : undefined }));
  },

  // Maintenance
  async getMaintenance(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/maintenance", { params }));
  },

  async approveMaintenance(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/maintenance/${id}/approve`));
  },

  async rejectMaintenance(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/maintenance/${id}/reject`));
  },

  async completeMaintenance(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/maintenance/${id}/complete`));
  },

  // Finance — Payouts
  async getPayouts(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/finance/payouts", { params }));
  },

  async processPayout(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/finance/payouts/${id}/process`));
  },

  async batchPayouts(ids: (string | number)[]) {
    return safeApiCall(() => client.post("/api/v1/finance/payouts/batch", { ids }));
  },

  // Finance — Payments / Refunds / Disputes
  async getAdminRefunds(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/payments/refunds", { params }));
  },

  async issueRefund(paymentId: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.post(`/api/v1/admin/payments/${paymentId}/refund`, data));
  },

  async getAdminDisputes(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/payments/disputes", { params }));
  },

  async updateDispute(paymentId: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.patch(`/api/v1/admin/payments/${paymentId}/dispute`, data));
  },

  // Finance — Revenue
  async getRevenueBreakdown(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/revenue/breakdown", { params }));
  },

  async fullExportRevenue(params?: Record<string, unknown>) {
    const response = await client.get("/api/v1/admin/revenue/full-export", { params, responseType: "blob" });
    return response.data as Blob;
  },

  // Reports
  async getFinancialReport(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/reports/financial", { params }));
  },

  async getUserGrowthReport(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/reports/user-growth", { params }));
  },

  // Subscription Plans
  async getSubscriptionPlans(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/subscription-plans", { params }));
  },

  async getAllPlans(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/subscription-plans", { params }));
  },

  async createSubscriptionPlan(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/subscription-plans", data));
  },

  async updateSubscriptionPlan(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/subscription-plans/${id}`, data));
  },

  async deleteSubscriptionPlan(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/subscription-plans/${id}`));
  },

  async toggleSubscriptionPlanActive(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/subscription-plans/${id}/toggle-active`));
  },

  // User Subscriptions
  async getUserSubscriptions(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/user-subscriptions", { params }));
  },

  async upgradeUserSubscription(userId: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.post(`/api/v1/admin/users/${userId}/subscription/upgrade`, data));
  },

  // Roles
  async getRoles() {
    return safeApiCall(() => client.get("/api/v1/admin/roles"));
  },

  // Users
  async updateUser(userId: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.patch(`/api/v1/admin/users/${userId}`, data));
  },

  // Quota
  async getQuotaOverages(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/quota/overview", { params }));
  },

  async getQuotaAnalytics(period?: string) {
    return safeApiCall(() => client.get("/api/v1/admin/quota/overview", { params: { period } }));
  },

  async getDistressOverrides(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/distress-overrides", { params }));
  },

  async revokeDistressOverride(userId: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/distress-overrides/${userId}`));
  },

  // Location Flags
  async getLocationFlags(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/location-flags", { params }));
  },

  async resolveLocationFlag(therapistId: string | number, action?: string, note?: string, newCountry?: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/resolve-location-flag`, { action, note, new_country: newCountry }));
  },

  // Territories (Sales)
  async getTerritories(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/sales/territories", { params }));
  },

  async getTerritoryDetail(id: string | number) {
    return safeApiCall(() => client.get(`/api/v1/admin/sales/territories/${id}`));
  },

  async createTerritory(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/sales/territories", data));
  },

  async updateTerritory(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/sales/territories/${id}`, data));
  },

  async deactivateTerritory(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/sales/territories/${id}`));
  },

  async assignAgentsToTerritory(territoryId: string | number, agents: (number | { user_id: number; role?: string; is_primary?: boolean })[]) {
    return safeApiCall(() => client.post(`/api/v1/admin/sales/territories/${territoryId}/assign`, { agents }));
  },

  async removeAgentFromTerritory(territoryId: string | number, userId: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/sales/territories/${territoryId}/agents/${userId}`));
  },

  // Sales Agents
  async getSalesAgents(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/users", { params: { ...params, role: "sales" } }));
  },

  // Corporates
  async getCorporates(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/corporates", { params }));
  },

  async sendCorporateLifecycleEmail(corporateId: string | number, emailType: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/corporates/${corporateId}/send-lifecycle-email`, { email_type: emailType }));
  },

  async extendCorporatePilot(corporateId: string | number, days: number) {
    return safeApiCall(() => client.post(`/api/v1/admin/corporates/${corporateId}/extend-pilot`, { days }));
  },

  async convertCorporateToPaid(corporateId: string | number, planTier: string, billingCycle: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/corporates/${corporateId}/convert-to-paid`, { plan_tier: planTier, billing_cycle: billingCycle }));
  },

  // University Config
  async getUniversityConfig(organizationId: string | number) {
    return safeApiCall(() => client.get(`/api/v1/admin/universities/${organizationId}/config`));
  },

  async updateUniversityConfig(organizationId: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/universities/${organizationId}/config`, data));
  },

  // Content Management
  async getContent(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/content", { params }));
  },

  async deleteContent(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/content/${id}`));
  },

  // Landing Page Content
  async getLandingPageContent(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/landing-page-content", { params }));
  },

  async createLandingPageContent(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/landing-page-content", data));
  },

  async deleteLandingPageContent(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/landing-page-content/${id}`));
  },

  async bulkUpdateLandingPageContent(items: Record<string, unknown>[]) {
    return safeApiCall(() => client.post("/api/v1/admin/landing-page-content/bulk-update", { items }));
  },

  // Editorial Posts
  async getEditorialPosts(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/editorial/posts", { params }));
  },

  async createEditorialPost(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/editorial/posts", data));
  },

  async updateEditorialPost(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/editorial/posts/${id}`, data));
  },

  async deleteEditorialPost(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/editorial/posts/${id}`));
  },

  async publishEditorialPost(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/editorial/posts/${id}/publish`));
  },

  async unpublishEditorialPost(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/admin/editorial/posts/${id}/unpublish`));
  },

  async uploadEditorialPostImage(id: string | number, file: File) {
    const fd = new FormData();
    fd.append("image", file);
    return safeApiCall(() => client.post(`/api/v1/admin/editorial/posts/${id}/image`, fd, { headers: { "Content-Type": "multipart/form-data" } }));
  },

  async getEditorialCategories() {
    return safeApiCall(() => client.get("/api/v1/admin/editorial/categories"));
  },

  async createEditorialCategory(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/admin/editorial/categories", data));
  },

  async deleteEditorialCategory(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/editorial/categories/${id}`));
  },

  // System
  async getSystemStatus() {
    return safeApiCall(() => client.get("/api/v1/system/status"));
  },

  async getLogs(lines?: number) {
    return safeApiCall(() => client.get("/api/v1/tech/system-logs", { params: lines ? { lines } : undefined }));
  },

  async clearLogs() {
    return safeApiCall(() => client.delete("/api/v1/tech/system-logs"));
  },

  // Login History
  async getLoginHistory(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/admin/audit-logs", { params }));
  },

  // Settings
  async updateSettings(group: string, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/admin/settings/${group}`, data));
  },

  // Promo Codes
  async getPromoCodeStats(uuid: string) {
    return safeApiCall(() => client.get(`/api/v1/admin/promo-codes/${uuid}/stats`));
  },
};
