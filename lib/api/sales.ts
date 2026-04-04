import client from './client';
import { parseApiResponse } from './utils';

export const salesService = {
  async getStats() {
    const response = await client.get('/api/v1/sales/stats');
    return parseApiResponse(response);
  },

  async getRevenueFlow(period: string) {
    const response = await client.get('/api/v1/sales/revenue-flow', { params: { period } });
    return parseApiResponse(response);
  },

  async getLeadSources(period: string) {
    const response = await client.get('/api/v1/sales/lead-sources', { params: { period } });
    return parseApiResponse(response);
  },

  async getDeals(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/sales/deals', { params });
    const data = parseApiResponse(response);
    // Handle paginated response
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  async getLeads(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/sales/leads', { params });
    const data = parseApiResponse(response);
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  async createLead(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/sales/leads', data);
    return parseApiResponse(response);
  },

  async updateLead(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/sales/leads/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteLead(id: number | string) {
    const response = await client.delete(`/api/v1/sales/leads/${id}`);
    return parseApiResponse(response);
  },

  async getContacts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/sales/contacts', { params });
    const data = parseApiResponse(response);
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  async createContact(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/sales/contacts', data);
    return parseApiResponse(response);
  },

  async updateContact(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/sales/contacts/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteContact(id: number | string) {
    const response = await client.delete(`/api/v1/sales/contacts/${id}`);
    return parseApiResponse(response);
  },

  async getTasks(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/sales/tasks', { params });
    const data = parseApiResponse(response);
    return Array.isArray(data) ? data : [];
  },

  async createTask(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/sales/tasks', data);
    return parseApiResponse(response);
  },

  async updateTask(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/sales/tasks/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteTask(id: number | string) {
    const response = await client.delete(`/api/v1/sales/tasks/${id}`);
    return parseApiResponse(response);
  },

  // Closer Dashboard Methods
  async getCloserDashboard() {
    const response = await client.get('/api/v1/sales/closer/dashboard');
    return parseApiResponse(response);
  },

  async getReadyToClose() {
    const response = await client.get('/api/v1/sales/closer/ready-to-close');
    return parseApiResponse(response);
  },

  async markDealWon(id: string | number) {
    const response = await client.post(`/api/v1/sales/closer/deals/${id}/mark-won`);
    return parseApiResponse(response);
  },

  async markDealLost(id: string | number, reason: string) {
    const response = await client.post(`/api/v1/sales/closer/deals/${id}/mark-lost`, { lost_reason: reason });
    return parseApiResponse(response);
  },

  // Relationship Manager (Builder) Methods
  async getManagedOrganizations() {
    const response = await client.get('/api/v1/institutional/organizations');
    const data = parseApiResponse(response);
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data;
    }
    return Array.isArray(data) ? data : [];
  },
};
