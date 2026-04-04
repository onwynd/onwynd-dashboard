import client from './client';
import { parseApiResponse } from './utils';
import { User } from './users';

export interface Member extends User {
  department?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
}

export const institutionalService = {
  async getEngagement(period: '7d' | '30d' | '90d' = '30d') {
    const organization = await this.getOrganization();
    const organizationId = (organization as Record<string, unknown> | null)?.id ?? 1;
    const response = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/engagement`, {
      params: { period },
    });
    return parseApiResponse(response);
  },

  async getStats() {
    // DB15: Use getOrganization() to avoid fragile array[0] pattern
    const organization = await this.getOrganization();
    const organizationId = (organization as Record<string, unknown> | null)?.id ?? 1;
    const engagement = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/engagement`, {
      params: { period: '30d' },
    });
    const engagementData = parseApiResponse(engagement) as any;
    const memberCount = engagementData?.member_count ?? 0;
    const activeUsers = engagementData?.active_users ?? 0;
    const sessionsCompleted = engagementData?.sessions_completed ?? 0;
    const assessmentsCompleted = engagementData?.assessments_completed ?? 0;
    return [
      { id: 'members', title: 'Members', value: String(memberCount), icon: 'users' },
      { id: 'active', title: 'Active Users', value: String(activeUsers), icon: 'activity' },
      { id: 'sessions', title: 'Sessions Completed', value: String(sessionsCompleted), icon: 'clock' },
      { id: 'assessments', title: 'Assessments', value: String(assessmentsCompleted), icon: 'file-text' },
    ];
  },

  async getMetrics() {
    // DB15: Use getOrganization() to avoid fragile array[0] pattern
    const organization = await this.getOrganization();
    const organizationId = (organization as Record<string, unknown> | null)?.id ?? 1;
    const engagementRes = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/engagement`, {
      params: { period: '30d' },
    });
    const atRiskRes = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/at-risk`);
    const engagementData = parseApiResponse(engagementRes) as any;
    const atRiskData = parseApiResponse(atRiskRes) as any;
    const metrics = {
      total_users: engagementData?.member_count ?? 0,
      active_users_this_month: engagementData?.active_users ?? 0,
      engagement_rate: engagementData?.member_count ? Math.round(((engagementData?.active_users ?? 0) / engagementData?.member_count) * 10000) / 100 : 0,
      total_sessions_completed: engagementData?.sessions_completed ?? 0,
      average_wellness_score: null,
      at_risk_users: atRiskData?.count ?? 0,
      intervention_success_rate: 0,
      cost_per_user: 0,
      estimated_roi: null,
    };
    return metrics;
  },

  async getAtRisk(params?: Record<string, unknown>) {
    // DB15: Use getOrganization() to avoid fragile array[0] pattern
    const organization = await this.getOrganization();
    const organizationId = (organization as Record<string, unknown> | null)?.id ?? 1;
    const response = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/at-risk`, { params });
    return parseApiResponse(response);
  },

  async getMonthlyReport(params?: Record<string, unknown>) {
    // DB15: Use getOrganization() to avoid fragile array[0] pattern
    const organization = await this.getOrganization();
    const organizationId = (organization as Record<string, unknown> | null)?.id ?? 1;
    const response = await client.get(`/api/v1/institutional/organizations/${organizationId}/analytics/monthly-report`, { params });
    return parseApiResponse(response);
  },

  async getReferrals(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/institutional/referrals', { params });
    return parseApiResponse(response);
  },

  async createReferral(data: unknown) {
    const response = await client.post('/api/v1/institutional/referrals', data);
    return parseApiResponse(response);
  },

  async updateReferralStatus(id: string | number, status: string) {
    const response = await client.patch(`/api/v1/institutional/referrals/${id}`, { status });
    return parseApiResponse(response);
  },

  async cancelReferral(id: string | number) {
    const response = await client.patch(`/api/v1/institutional/referrals/${id}`, { status: 'cancelled' });
    return parseApiResponse(response);
  },

  async getPlans() {
    const response = await client.get('/api/v1/institutional/subscriptions/plans');
    return parseApiResponse(response);
  },

  // Document Management
  async getRecentDocuments(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/institutional/documents', { params });
    return parseApiResponse(response);
  },

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/api/v1/institutional/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },

  async deleteDocument(id: string | number) {
    const response = await client.delete(`/api/v1/institutional/documents/${id}`);
    return parseApiResponse(response);
  },

  // Member Management
  async getMembers(organizationId: string | number, params?: Record<string, unknown>) {
    const response = await client.get(`/api/v1/institutional/organizations/${organizationId}/members`, { params });
    return parseApiResponse(response);
  },

  async addMember(organizationId: string | number, data: Partial<Member>) {
    const response = await client.post(`/api/v1/institutional/organizations/${organizationId}/members`, data);
    return parseApiResponse(response);
  },

  async updateMember(organizationId: string | number, id: string | number, data: Partial<Member>) {
    const response = await client.put(`/api/v1/institutional/organizations/${organizationId}/members/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteMember(organizationId: string | number, id: string | number) {
    const response = await client.delete(`/api/v1/institutional/organizations/${organizationId}/members/${id}`);
    return parseApiResponse(response);
  },

  async importMembers(organizationId: string | number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post(`/api/v1/institutional/organizations/${organizationId}/members/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return parseApiResponse(response);
  },

  async getOrganization() {
    const response = await client.get('/api/v1/institutional/organizations');
    const list = parseApiResponse(response);
    return (Array.isArray(list) ? list : [])[0] ?? null;
  },

  async updateOrganization(organizationId: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/institutional/organizations/${organizationId}`, data);
    return parseApiResponse(response);
  },

  async getBranding(organizationId: string | number) {
    const response = await client.get(`/api/v1/institutional/organizations/${organizationId}/branding`);
    return parseApiResponse(response) as { theme?: string; font?: string };
  },

  async updateBranding(organizationId: string | number, data: { theme?: string; font?: string }) {
    const response = await client.put(`/api/v1/institutional/organizations/${organizationId}/branding`, data);
    return parseApiResponse(response);
  },

  // Per-Seat Quota Usage — institutional quota status endpoint
  async getQuotaUsage() {
    const response = await client.get('/api/v1/institutional/quota/status');
    return response.data?.data ?? response.data;
  },

  async getStudentVerifications() {
    const response = await client.get('/api/v1/institutional/student-verifications');
    return response.data?.data ?? response.data;
  },
};

