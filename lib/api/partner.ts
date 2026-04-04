import client from './client';

export const partnerService = {
  async getStats() {
    const response = await client.get('/api/v1/partner/stats');
    return response.data.data ?? response.data;
  },

  async getEmployees(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/partner/employees', { params });
    return response.data.data ?? response.data;
  },

  async getFinancialFlow(period: string) {
    const response = await client.get(`/api/v1/partner/financial-flow?period=${period}`);
    return response.data.data ?? response.data;
  }
};
