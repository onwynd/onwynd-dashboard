import client from './client';

export const legalService = {
  async getStats() {
    const response = await client.get('/api/v1/legal/stats');
    return response.data.data ?? response.data;
  },

  async getCases(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/legal/cases', { params });
    return response.data.data ?? response.data;
  },

  async getCaseDetails(id: string) {
    const response = await client.get(`/api/v1/legal/cases/${id}`);
    return response.data.data ?? response.data;
  }
};
