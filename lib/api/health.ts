import client from './client';

export const healthService = {
  /**
   * Personal dashboard summary: My Check-ins Today, Reports Submitted,
   * Pending Reports, Active Distress Cases.
   */
  async getDashboardStats() {
    const response = await client.get('/api/v1/health/dashboard');
    return response.data.data ?? response.data;
  },

  /**
   * Check-ins performed by the authenticated health personnel (today-scoped by default).
   */
  async getCheckIns(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/health/checkins/my', { params });
    return response.data.data ?? response.data;
  },

  /**
   * Reports submitted by the authenticated health personnel.
   */
  async getRecentDocuments(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/health/reports/my', { params });
    return response.data.data ?? response.data;
  },

  /**
   * Activity chart data. period = 'day' | 'week' | 'month'
   */
  async getChartData(period: string) {
    const response = await client.get(`/api/v1/health/chart-data?period=${period}`);
    return response.data.data ?? response.data;
  },
};
