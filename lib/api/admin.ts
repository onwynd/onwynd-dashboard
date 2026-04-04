import client from './client';
import { parseApiResponse } from './utils';

export const adminService = {
  async getStats() {
    const response = await client.get('/api/v1/admin/dashboard');
    return parseApiResponse(response);
  },
  async getRevenueFlow(period: string = '6months') {
    const response = await client.get(`/api/v1/admin/dashboard/revenue-flow?period=${period}`);
    return parseApiResponse(response);
  },
  async getLeadSources(period: string = '30days') {
    const response = await client.get(`/api/v1/admin/dashboard/lead-sources?period=${period}`);
    return parseApiResponse(response);
  },
  async getRecentDeals() {
    const response = await client.get('/api/v1/admin/dashboard/deals');
    return parseApiResponse(response);
  },
  async getPendingTherapists() {
    const response = await client.get('/api/v1/admin/therapists/pending');
    return parseApiResponse(response);
  },
  async approveTherapist(id: string) {
    const response = await client.post(`/api/v1/admin/therapists/${id}/approve`);
    return parseApiResponse(response);
  },
  async rejectTherapist(id: string, reason: string) {
    const response = await client.post(`/api/v1/admin/therapists/${id}/reject`, { reason });
    return parseApiResponse(response);
  },

  async viewTherapistDocument(id: string | number, type: string) {
    const response = await client.get(`/api/v1/admin/therapists/${id}/documents/${type}`, { responseType: 'blob' });
    return response.data;
  },
  async getUsers(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/users', { params });
    return parseApiResponse(response);
  },

  async getAllPlans() {
    const response = await client.get('/api/v1/pricing/plans');
    return parseApiResponse(response);
  },

  // Approvals
  async getUpgradeRequests(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/subscription-upgrade/requests', { params });
    return parseApiResponse(response);
  },
  async getUpgradeRequestStats(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/subscription-upgrade/requests/stats', { params });
    return parseApiResponse(response);
  },
  async approveUpgradeRequest(id: number | string) {
    const response = await client.post(`/api/v1/admin/subscription-upgrade/requests/${id}/approve`);
    return parseApiResponse(response);
    },
  async denyUpgradeRequest(id: number | string) {
    const response = await client.post(`/api/v1/admin/subscription-upgrade/requests/${id}/deny`);
    return parseApiResponse(response);
  },

  async getRoles() {
    const response = await client.get('/api/v1/admin/roles');
    return parseApiResponse(response);
  },

  async updateUser(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/users/${id}`, data);
    return parseApiResponse(response);
  },

  async upgradeUserSubscription(userId: number | string, data: {
    plan_uuid: string;
    billing_interval?: 'monthly' | 'annual' | 'yearly' | 'year';
    auto_renew?: boolean;
    comped?: boolean;
    include_in_revenue?: boolean;
  }) {
    const response = await client.post(`/api/v1/admin/users/${userId}/subscription/upgrade`, data);
    return parseApiResponse(response);
  },

  // Reports
  async getFinancialReport(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/reports/financial', { params });
    return parseApiResponse(response);
  },

  async getUserGrowthReport(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/reports/user-growth', { params });
    return parseApiResponse(response);
  },

  // Resources CRUD
  async getResources(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/resources', { params });
    return parseApiResponse(response);
  },

  async getResource(id: string | number) {
    const response = await client.get(`/api/v1/admin/resources/${id}`);
    return parseApiResponse(response);
  },

  async createResource(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/resources', data);
    return parseApiResponse(response);
  },

  async updateResource(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/resources/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteResource(id: string | number) {
    const response = await client.delete(`/api/v1/admin/resources/${id}`);
    return parseApiResponse(response);
  },

  async approveResource(id: string | number) {
    const response = await client.post(`/api/v1/admin/resources/${id}/approve`);
    return parseApiResponse(response);
  },

  async rejectResource(id: string | number) {
    const response = await client.post(`/api/v1/admin/resources/${id}/reject`);
    return parseApiResponse(response);
  },

  async createResourceCategory(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/resources/categories', data);
    return parseApiResponse(response);
  },

  // Content CRUD
  async getContent(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/content', { params });
    return parseApiResponse(response);
  },

  async getContentItem(id: string | number) {
    const response = await client.get(`/api/v1/admin/content/${id}`);
    return parseApiResponse(response);
  },

  async createContent(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/content', data);
    return parseApiResponse(response);
  },

  async updateContent(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/content/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteContent(id: string | number) {
    const response = await client.delete(`/api/v1/admin/content/${id}`);
    return parseApiResponse(response);
  },

  // Sessions CRUD
  async getSessions(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/sessions', { params });
    return response.data.data ?? response.data;
  },

  async getSession(id: string | number) {
    const response = await client.get(`/api/v1/admin/sessions/${id}`);
    return response.data.data ?? response.data;
  },

  async createSession(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/sessions', data);
    return response.data.data ?? response.data;
  },

  async updateSession(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/sessions/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteSession(id: string | number) {
    const response = await client.delete(`/api/v1/admin/sessions/${id}`);
    return response.data.data ?? response.data;
  },

  // Maintenance
  async getMaintenance(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/maintenance', { params });
    return response.data.data ?? response.data;
  },

  async approveMaintenance(id: string | number) {
    const response = await client.post(`/api/v1/admin/maintenance/${id}/approve`);
    return response.data.data ?? response.data;
  },

  async rejectMaintenance(id: string | number) {
    const response = await client.post(`/api/v1/admin/maintenance/${id}/reject`);
    return response.data.data ?? response.data;
  },

  async completeMaintenance(id: string | number) {
    const response = await client.post(`/api/v1/admin/maintenance/${id}/complete`);
    return response.data.data ?? response.data;
  },

  // Therapists (full list)
  async getTherapists(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/therapists', { params });
    return response.data.data ?? response.data;
  },

  async getTherapist(id: string | number) {
    const response = await client.get(`/api/v1/admin/therapists/${id}`);
    return response.data.data ?? response.data;
  },

  async deactivateTherapist(id: string | number) {
    const response = await client.post(`/api/v1/admin/therapists/${id}/deactivate`);
    return response.data.data ?? response.data;
  },

  async activateTherapist(id: string | number) {
    const response = await client.post(`/api/v1/admin/therapists/${id}/activate`);
    return response.data.data ?? response.data;
  },

  async inviteTherapist(email: string, notes?: string) {
    const response = await client.post('/api/v1/admin/therapists/invite', { email, notes });
    return response.data.data ?? response.data;
  },

  async getTherapistInvites() {
    const response = await client.get('/api/v1/admin/therapists/invites');
    return response.data.data ?? response.data;
  },

  async revokeTherapistInvite(id: number) {
    const response = await client.delete(`/api/v1/admin/therapists/invites/${id}`);
    return response.data.data ?? response.data;
  },

  async getCourses(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/courses', { params });
    return response.data.data ?? response.data;
  },

  async getCourse(id: string | number) {
    const response = await client.get(`/api/v1/admin/courses/${id}`);
    return response.data.data ?? response.data;
  },

  async createCourse(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/courses', data);
    return parseApiResponse(response);
  },

  async updateCourse(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/courses/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteCourse(id: string | number) {
    const response = await client.delete(`/api/v1/admin/courses/${id}`);
    return parseApiResponse(response);
  },

  async getCommunities(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/communities', { params });
    return parseApiResponse(response);
  },

  // Universities (admin-only configuration)
  async listUniversities(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/institutional/universities', { params });
    return parseApiResponse(response);
  },

  async getUniversityConfig(organizationId: string | number) {
    const response = await client.get(`/api/v1/admin/universities/${organizationId}/config`);
    return parseApiResponse(response);
  },

  async updateUniversityConfig(organizationId: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/universities/${organizationId}/config`, data);
    return parseApiResponse(response);
  },

  async getCommunity(id: string | number) {
    const response = await client.get(`/api/v1/admin/communities/${id}`);
    return parseApiResponse(response);
  },

  async createCommunity(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/communities', data);
    return parseApiResponse(response);
  },

  async updateCommunity(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/communities/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteCommunity(id: string | number) {
    const response = await client.delete(`/api/v1/admin/communities/${id}`);
    return parseApiResponse(response);
  },

  // Sounds - returns { data: SoundFile[], categories: string[] }
  async getSounds(category?: string) {
    const params = category ? { category } : {};
    const response = await client.get('/api/v1/admin/sounds', { params });
    // SoundController returns { data: [...], categories: [...] } directly (not via sendResponse)
    return response.data;
  },
  async uploadSound(file: File, category?: string) {
    const form = new FormData();
    form.append('file', file);
    if (category) {
      form.append('category', category);
    }
    const response = await client.post('/api/v1/admin/sounds', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },
  async deleteSound(filename: string, category?: string) {
    const params = category ? { category } : {};
    const response = await client.delete(`/api/v1/admin/sounds/${encodeURIComponent(filename)}`, { params });
    return parseApiResponse(response);
  },

  // Centers
  async getCenters(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/centers', { params });
    return parseApiResponse(response);
  },

  async getCenter(id: string | number) {
    const response = await client.get(`/api/v1/admin/centers/${id}`);
    return parseApiResponse(response);
  },

  async createCenter(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/centers', data);
    return parseApiResponse(response);
  },

  async updateCenter(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/centers/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteCenter(id: string | number) {
    const response = await client.delete(`/api/v1/admin/centers/${id}`);
    return parseApiResponse(response);
  },

  // Landing Page Content Management
  async getLandingPageContent(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/landing-page-content', { params });
    return parseApiResponse(response);
  },

  async getLandingPageContentBySection(section: string) {
    const response = await client.get(`/api/v1/admin/landing-page-content/section/${section}`);
    return parseApiResponse(response);
  },

  async createLandingPageContent(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/landing-page-content', data);
    return parseApiResponse(response);
  },

  async updateLandingPageContent(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/landing-page-content/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteLandingPageContent(id: string | number) {
    const response = await client.delete(`/api/v1/admin/landing-page-content/${id}`);
    return parseApiResponse(response);
  },

  async bulkUpdateLandingPageContent(content: Record<string, unknown>[]) {
    const response = await client.post('/api/v1/admin/landing-page-content/bulk-update', { content });
    return parseApiResponse(response);
  },

  // Editorial Articles
  async getEditorialPosts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/editorial/posts', { params });
    return parseApiResponse(response);
  },

  async getEditorialPost(id: string | number) {
    const response = await client.get(`/api/v1/admin/editorial/posts/${id}`);
    return parseApiResponse(response);
  },

  async createEditorialPost(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/editorial/posts', data);
    return parseApiResponse(response);
  },

  async updateEditorialPost(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/editorial/posts/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteEditorialPost(id: string | number) {
    const response = await client.delete(`/api/v1/admin/editorial/posts/${id}`);
    return parseApiResponse(response);
  },

  async publishEditorialPost(id: string | number) {
    const response = await client.post(`/api/v1/admin/editorial/posts/${id}/publish`);
    return parseApiResponse(response);
  },

  async unpublishEditorialPost(id: string | number) {
    const response = await client.post(`/api/v1/admin/editorial/posts/${id}/unpublish`);
    return parseApiResponse(response);
  },

  async getEditorialCategories() {
    const response = await client.get('/api/v1/admin/editorial/categories');
    return parseApiResponse(response);
  },

  async createEditorialCategory(data: { name: string; description?: string }) {
    const response = await client.post('/api/v1/admin/editorial/categories', data);
    return parseApiResponse(response);
  },

  async deleteEditorialCategory(id: string | number) {
    const response = await client.delete(`/api/v1/admin/editorial/categories/${id}`);
    return parseApiResponse(response);
  },

  async uploadEditorialPostImage(id: string | number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await client.post(`/api/v1/admin/editorial/posts/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },

  // Careers / Job Postings
  async getCareers(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/careers', { params });
    return parseApiResponse(response);
  },

  async getCareer(id: string | number) {
    const response = await client.get(`/api/v1/admin/careers/${id}`);
    return parseApiResponse(response);
  },

  async createCareer(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/careers', data);
    return parseApiResponse(response);
  },

  async updateCareer(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/careers/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteCareer(id: string | number) {
    const response = await client.delete(`/api/v1/admin/careers/${id}`);
    return parseApiResponse(response);
  },

  async toggleCareer(id: string | number) {
    const response = await client.post(`/api/v1/admin/careers/${id}/toggle`);
    return parseApiResponse(response);
  },

  // Job Applications
  async getJobApplications(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/careers/applications', { params });
    return parseApiResponse(response);
  },

  async getRecentJobApplications() {
    const response = await client.get('/api/v1/admin/careers/applications/recent');
    return parseApiResponse(response);
  },

  async getJobApplication(uuid: string) {
    const response = await client.get(`/api/v1/admin/careers/applications/${uuid}`);
    return parseApiResponse(response);
  },

  async updateJobApplication(uuid: string, data: Record<string, unknown>) {
    const response = await client.patch(`/api/v1/admin/careers/applications/${uuid}`, data);
    return parseApiResponse(response);
  },

  async deleteJobApplication(uuid: string) {
    const response = await client.delete(`/api/v1/admin/careers/applications/${uuid}`);
    return parseApiResponse(response);
  },

  // Revenue
  async getRevenueByCenter(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/by-center', { params });
    return parseApiResponse(response);
  },

  async getRevenueMonthlyTrends(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/monthly-trends', { params });
    return parseApiResponse(response);
  },

  async getRevenueByService(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/by-service', { params });
    return parseApiResponse(response);
  },

  async getRevenueAnalytics(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/analytics', { params });
    return parseApiResponse(response);
  },

  async exportRevenue(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/export', { params, responseType: 'blob' });
    return response.data;
  },

  async getRevenueBreakdown(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/revenue/breakdown', { params });
    return parseApiResponse(response);
  },

  async fullExportRevenue(params: Record<string, unknown> & { format: 'csv' | 'pdf' }) {
    if (params.format === 'csv') {
      const response = await client.get('/api/v1/admin/revenue/full-export', { params, responseType: 'blob' });
      return response.data;
    }
    const response = await client.get('/api/v1/admin/revenue/full-export', { params });
    return parseApiResponse(response);
  },

  // Payouts
  async getPayouts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/finance/payouts', { params });
    return parseApiResponse(response);
  },

  async processPayout(id: string | number) {
    const response = await client.post(`/api/v1/admin/finance/payouts/${id}/process`);
    return parseApiResponse(response);
  },

  async batchPayouts(ids: (string | number)[]) {
    const response = await client.post('/api/v1/admin/finance/payouts/batch', { ids });
    return parseApiResponse(response);
  },

  // System Health — real metrics (CPU, RAM, disk, DB, Redis)
  async getSystemStatus() {
    const response = await client.get('/api/v1/ceo/system-health');
    return parseApiResponse(response);
  },

  // Laravel log viewer
  async getLogs(lines: number = 200) {
    const response = await client.get(`/api/v1/ceo/logs?lines=${lines}`);
    return parseApiResponse(response);
  },
  async clearLogs() {
    const response = await client.delete('/api/v1/ceo/logs');
    return parseApiResponse(response);
  },

  // Auth sessions (Sanctum token management)
  async getAuthSessions() {
    const response = await client.get('/api/v1/admin/auth-sessions');
    return parseApiResponse(response);
  },
  async revokeAuthSession(id: number) {
    const response = await client.delete(`/api/v1/admin/auth-sessions/${id}`);
    return parseApiResponse(response);
  },
  async revokeUserSessions(userId: number) {
    const response = await client.delete(`/api/v1/admin/auth-sessions/user/${userId}`);
    return parseApiResponse(response);
  },
  async getLoginHistory(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/login-history', { params });
    return parseApiResponse(response);
  },
  async getUserLoginHistory(userId: number) {
    const response = await client.get(`/api/v1/admin/users/${userId}/login-history`);
    return parseApiResponse(response);
  },

  async getUserQuotaUsage(userId: string | number) {
    const response = await client.get(`/api/v1/admin/users/${userId}/quota`);
    return parseApiResponse(response);
  },

  // Overages are surfaced via the quota overview stats (no dedicated overages endpoint exists)
  async getQuotaOverages(_params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/quota/overview');
    return parseApiResponse(response);
  },

  // Users with active manual quota overrides (distress / admin-granted)
  async getDistressOverrides(params?: { search?: string; per_page?: number; page?: number }) {
    const response = await client.get('/api/v1/admin/distress-overrides', { params });
    return parseApiResponse(response);
  },

  async revokeDistressOverride(userId: number | string) {
    const response = await client.delete(`/api/v1/admin/distress-overrides/${userId}`);
    return parseApiResponse(response);
  },

  async resetUserQuota(userId: number | string) {
    const response = await client.post(`/api/v1/admin/users/${userId}/quota/reset`);
    return parseApiResponse(response);
  },

  // Analytics
  async getAnalyticsReports(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/reports/financial', { params });
    return response.data.data ?? response.data;
  },

  async getUserGrowthAnalytics(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/reports/user-growth', { params });
    return response.data.data ?? response.data;
  },

  // Support (admin read-only)
  async getSupportTickets(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/support/tickets', { params });
    return response.data.data ?? response.data;
  },

  async getSupportTicket(id: string | number) {
    const response = await client.get(`/api/v1/admin/support/tickets/${id}`);
    return response.data.data ?? response.data;
  },

  async getSupportStats() {
    const response = await client.get('/api/v1/admin/support/stats');
    return response.data.data ?? response.data;
  },

  // Payments / Refunds / Disputes
  async getAdminPayments(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/payments', { params });
    return response.data.data ?? response.data;
  },

  async getAdminRefunds(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/payments/refunds', { params });
    return response.data.data ?? response.data;
  },

  async issueRefund(paymentId: number | string, data: { amount?: number; reason?: string }) {
    const response = await client.post(`/api/v1/admin/payments/${paymentId}/refund`, data);
    return response.data.data ?? response.data;
  },

  async getAdminDisputes(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/payments/disputes', { params });
    return response.data.data ?? response.data;
  },

  async updateDispute(paymentId: number | string, data: { action: 'flag' | 'resolve' | 'accept'; notes?: string }) {
    const response = await client.patch(`/api/v1/admin/payments/${paymentId}/dispute`, data);
    return response.data.data ?? response.data;
  },

  // â”€â”€ Subscription Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getSubscriptionPlans(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/subscription-plans', { params });
    return response.data.data ?? response.data;
  },

  async getSubscriptionPlan(id: number | string) {
    const response = await client.get(`/api/v1/admin/subscription-plans/${id}`);
    return response.data.data ?? response.data;
  },

  async createSubscriptionPlan(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/subscription-plans', data);
    return response.data.data ?? response.data;
  },

  async updateSubscriptionPlan(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/subscription-plans/${id}`, data);
    return response.data.data ?? response.data;
  },

  async toggleSubscriptionPlanActive(id: number | string) {
    const response = await client.post(`/api/v1/admin/subscription-plans/${id}/toggle-active`);
    return response.data.data ?? response.data;
  },

  async deleteSubscriptionPlan(id: number | string) {
    const response = await client.delete(`/api/v1/admin/subscription-plans/${id}`);
    return response.data.data ?? response.data;
  },

  // â”€â”€ User Subscriptions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getUserSubscriptions(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/user-subscriptions', { params });
    return response.data.data ?? response.data;
  },

  // â”€â”€ Sales Agents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getSalesAgents() {
    const response = await client.get('/api/v1/admin/users', {
      params: { role: 'sales', per_page: 200 },
    });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  // â”€â”€ Territories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getTerritories(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/sales/territories', { params });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getTerritoryDetail(id: number | string) {
    const response = await client.get(`/api/v1/admin/sales/territories/${id}`);
    return response.data.data ?? response.data;
  },

  async createTerritory(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/admin/sales/territories', data);
    return response.data.data ?? response.data;
  },

  async updateTerritory(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/sales/territories/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deactivateTerritory(id: number | string) {
    const response = await client.delete(`/api/v1/admin/sales/territories/${id}`);
    return response.data.data ?? response.data;
  },

  async assignAgentsToTerritory(
    territoryId: number | string,
    assignments: { user_id: number; role: string; is_primary: boolean }[],
  ) {
    const response = await client.post(
      `/api/v1/admin/sales/territories/${territoryId}/assign`,
      { assignments },
    );
    return response.data.data ?? response.data;
  },

  async removeAgentFromTerritory(territoryId: number | string, userId: number | string) {
    const response = await client.delete(
      `/api/v1/admin/sales/territories/${territoryId}/agents/${userId}`,
    );
    return response.data.data ?? response.data;
  },

  //  AI Inference Cost (Feature 2) 
  async getAICostSummary(period: string = '30d') {
    const response = await client.get('/api/v1/admin/ai/cost-summary', { params: { period } });
    return response.data?.data ?? response.data;
  },

  //  Disputes v2 (Feature 9) 
  async getDisputes(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/disputes', { params });
    return response.data?.data ?? response.data;
  },

  async resolveDispute(id: number | string, data: { status: string; resolution_notes?: string }) {
    const response = await client.put(`/api/v1/admin/disputes/${id}`, data);
    return response.data?.data ?? response.data;
  },

  async getSettings() {
    const response = await client.get('/api/v1/admin/settings');
    return (response.data?.data ?? response.data ?? {}) as Record<string, any>;
  },

  async updateSettings(section: string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/admin/settings/${section}`, data);
    return parseApiResponse(response);
  },

  // -- Corporate Account Management --
  async getCorporates(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/corporates', { params });
    return parseApiResponse(response);
  },

  async sendCorporateLifecycleEmail(corporateId: number, emailType: string) {
    const response = await client.post(`/api/v1/admin/corporates/${corporateId}/send-lifecycle-email`, {
      email_type: emailType,
    });
    return parseApiResponse(response);
  },

  async extendCorporatePilot(corporateId: number, days: number) {
    const response = await client.post(`/api/v1/admin/corporates/${corporateId}/extend-pilot`, { days });
    return parseApiResponse(response);
  },

  async convertCorporateToPaid(corporateId: number, planTier: string, billingCycle: string) {
    const response = await client.post(`/api/v1/admin/corporates/${corporateId}/convert-to-paid`, {
      plan_tier: planTier,
      billing_cycle: billingCycle,
    });
    return parseApiResponse(response);
  },

  // -- Promotional Code Stats --
  async getPromoCodeStats(id: number | string) {
    const response = await client.get(`/api/v1/admin/promo-codes/${id}/stats`);
    return response.data?.data;
  },

  // -- Location Flags --
  async getLocationFlags(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/admin/therapists/location-flags', { params });
    return response.data?.data;
  },
  async resolveLocationFlag(therapistId: number, action: string, note?: string, newCountry?: string) {
    const body: Record<string, unknown> = { action };
    if (note) body.note = note;
    if (newCountry) body.new_country = newCountry;
    const response = await client.post(`/api/v1/admin/therapists/${therapistId}/resolve-location-flag`, body);
    return response.data;
  },
};
