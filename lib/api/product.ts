import client from './client';

export const productService = {
  async getStats() {
    const response = await client.get('/api/v1/product/stats');
    return response.data.data ?? response.data;
  },

  async getProducts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/product/items', { params });
    return response.data.data ?? response.data;
  },
  
  async getPerformance(period: string) {
    const response = await client.get('/api/v1/product/performance', { params: { period } });
    return response.data.data ?? response.data;
  }
};
