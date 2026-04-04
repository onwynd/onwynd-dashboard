import client from './client';

export const financeService = {
  async getStats() {
    const response = await client.get('/api/v1/finance/stats');
    return response.data.data ?? response.data;
  },

  async getDashboard() {
    // No dedicated /finance/dashboard route — stats is the aggregate entry point
    const response = await client.get('/api/v1/finance/stats');
    return response.data.data ?? response.data;
  },

  async getPnl(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/pnl', { params });
    return response.data.data ?? response.data;
  },

  async getCac(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/cac', { params });
    return response.data.data ?? response.data;
  },

  async getLtv(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/ltv', { params });
    return response.data.data ?? response.data;
  },

  async getTransactions(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/transactions', { params });
    return response.data.data ?? response.data;
  },

  async getRevenueData(period: string) {
    const response = await client.get('/api/v1/finance/revenue', { params: { period } });
    return response.data.data ?? response.data;
  },

  async getExpenseBreakdown(period: string) {
    const response = await client.get('/api/v1/finance/expenses', { params: { period } });
    return response.data.data ?? response.data;
  },

  async getInvoices(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/invoices', { params });
    return response.data.data ?? response.data;
  },

  async createInvoice(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/finance/invoices', data);
    return response.data.data ?? response.data;
  },

  async updateInvoice(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/finance/invoices/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteInvoice(id: string | number) {
    const response = await client.delete(`/api/v1/finance/invoices/${id}`);
    return response.data.data ?? response.data;
  },

  async getPayouts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/finance/payouts', { params });
    return response.data.data ?? response.data;
  },

  async createPayout(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/finance/payouts', data);
    return response.data.data ?? response.data;
  },

  async processPayout(id: string | number, action: 'approve' | 'reject' = 'approve', reason?: string) {
    const payload: Record<string, unknown> = { action };
    if (reason) payload.reason = reason;
    const response = await client.post(`/api/v1/finance/payouts/${id}/process`, payload);
    return response.data.data ?? response.data;
  },

  async batchProcessPayouts(ids: (string | number)[]) {
    const response = await client.post('/api/v1/finance/payouts/batch', { ids });
    return response.data.data ?? response.data;
  },

  async reconcileTransaction(id: string, status: string = 'reconciled') {
    const response = await client.put(`/api/v1/finance/transactions/${id}/reconcile`, { status });
    return response.data.data ?? response.data;
  }
};
