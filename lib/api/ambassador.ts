import client from './client';

export const ambassadorService = {
  // Dashboard
  async getDashboard() {
    const response = await client.get('/api/v1/ambassador/dashboard');
    return response.data.data ?? response.data;
  },
  
  // Stats
  async getStats() {
    const response = await client.get('/api/v1/ambassador/stats');
    return response.data.data ?? response.data;
  },

  // Referrals
  async getReferrals(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/ambassador/referrals', { params });
    return response.data.data ?? response.data;
  },

  // Payouts
  async getPayouts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/ambassador/payouts', { params });
    return response.data.data ?? response.data;
  },

  async requestPayout(data?: Record<string, unknown>) {
    const response = await client.post('/api/v1/ambassador/payouts', data);
    return response.data.data ?? response.data;
  },

  // People
  async getPeople(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/ambassador/people', { params });
    return response.data.data ?? response.data;
  },

  // Performance chart data
  async getPerformance(period: string) {
    const response = await client.get('/api/v1/ambassador/performance', { params: { period } });
    return response.data.data ?? response.data;
  },

  // Referral code
  async getReferralCode() {
    const response = await client.get('/api/v1/ambassador/referral-code');
    return response.data.data ?? response.data;
  },
};
