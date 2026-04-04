import client from './client';

export const cooService = {
  async getOperationsOverview() {
    return client.get('/api/v1/coo/operations-overview');
  },

  async getAiOperations() {
    return client.get('/api/v1/coo/ai-operations');
  },

  async getMarketingFunnel() {
    return client.get('/api/v1/coo/marketing/funnel');
  },

  async getOperationalLogs(page = 1) {
    return client.get(`/api/v1/coo/operational-logs?page=${page}`);
  },

  async createOperationalLog(data: any) {
    return client.post('/api/v1/coo/operational-logs', data);
  },

  async updateOperationalLog(id: number | string, data: any) {
    return client.patch(`/api/v1/coo/operational-logs/${id}`, data);
  },

  async deleteOperationalLog(id: number | string) {
    return client.delete(`/api/v1/coo/operational-logs/${id}`);
  },

  async getMarketingCampaigns(page = 1) {
    return client.get(`/api/v1/marketing/campaigns?page=${page}`);
  },

  async createMarketingCampaign(data: any) {
    return client.post('/api/v1/marketing/campaigns', data);
  },

  async updateMarketingCampaign(id: number | string, data: any) {
    return client.put(`/api/v1/marketing/campaigns/${id}`, data);
  },

  async deleteMarketingCampaign(id: number | string) {
    return client.delete(`/api/v1/marketing/campaigns/${id}`);
  },
};
