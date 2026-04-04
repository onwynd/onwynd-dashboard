import client from './client';

export const complianceService = {
  async getStats() {
    const response = await client.get('/api/v1/compliance/stats');
    return response.data.data ?? response.data;
  },

  async getIssues(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/compliance/issues', { params });
    return response.data.data ?? response.data;
  },
  
  async getAuditData(period: string) {
    const response = await client.get('/api/v1/compliance/audit', { params: { period } });
    return response.data.data ?? response.data;
  },

  async updateIssue(id: string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/compliance/issues/${id}`, data);
    return response.data.data ?? response.data;
  }
};
