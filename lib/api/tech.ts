import client from './client';

export const techService = {
  async getStats() {
    const response = await client.get('/api/v1/tech/stats');
    return response.data.data ?? response.data;
  },

  async getIncidents(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/tech/incidents', { params });
    return response.data.data ?? response.data;
  },

  async getSystemHealth(period: string) {
    const response = await client.get(`/api/v1/tech/system-health?period=${period}`);
    return response.data.data ?? response.data;
  },

  async getSystemStatus(period: string) {
    const response = await client.get(`/api/v1/tech/system-status?period=${period}`);
    return response.data.data ?? response.data;
  },

  async getLogs(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/tech/logs', { params });
    return response.data.data ?? response.data;
  },

  async getSystemLogs() {
    const response = await client.get('/api/v1/tech/system-logs');
    return response.data.data ?? response.data;
  }
};
