import client from './client';

export const centerService = {
  // Dashboard
  async getDashboard() {
    const response = await client.get('/api/v1/center/dashboard');
    return response.data.data ?? response.data;
  },

  // Bookings
  async getBookings(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/center/bookings', { params });
    return response.data.data ?? response.data;
  },

  async createBooking(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/center/bookings', data);
    return response.data.data ?? response.data;
  },

  async updateBooking(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/center/bookings/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteBooking(id: string | number) {
    const response = await client.delete(`/api/v1/center/bookings/${id}`);
    return response.data.data ?? response.data;
  },

  // Inventory
  async getInventory(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/center/inventory', { params });
    return response.data.data ?? response.data;
  },

  async createInventoryItem(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/center/inventory', data);
    return response.data.data ?? response.data;
  },

  async updateInventoryItem(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/center/inventory/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteInventoryItem(id: string | number) {
    const response = await client.delete(`/api/v1/center/inventory/${id}`);
    return response.data.data ?? response.data;
  },

  // Reports
  async getReports(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/center/reports', { params });
    return response.data.data ?? response.data;
  },

  // Check-In
  async checkIn(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/center/check-in', data);
    return response.data.data ?? response.data;
  },
};
