import client from './client';
import { SubscriptionPlan } from './settings';

export const pmService = {
  async getDashboard() {
    const response = await client.get('/api/v1/product-manager/dashboard');
    return response.data.data ?? response.data;
  },

  async getStats() {
    const response = await client.get('/api/v1/product-manager/stats');
    return response.data.data ?? response.data;
  },

  async getTasks(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/product-manager/tasks', { params });
    return response.data.data ?? response.data;
  },

  async getRoadmap() {
    const response = await client.get('/api/v1/product-manager/roadmap');
    return response.data.data ?? response.data;
  },

  async createRoadmapItem(data: unknown) {
    const response = await client.post('/api/v1/product-manager/roadmap', data);
    return response.data.data ?? response.data;
  },

  async updateRoadmapItem(id: string, data: unknown) {
    const response = await client.put(`/api/v1/product-manager/roadmap/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteRoadmapItem(id: string) {
    const response = await client.delete(`/api/v1/product-manager/roadmap/${id}`);
    return response.data.data ?? response.data;
  },

  async getVelocity(sprint?: string) {
    const response = await client.get('/api/v1/product-manager/velocity', { params: { sprint } });
    return response.data.data ?? response.data;
  },

  // Feature Management
  async getFeaturesList(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/product-manager/features', { params });
    return response.data.data ?? response.data;
  },

  async createFeature(data: unknown) {
    const response = await client.post('/api/v1/product-manager/features', data);
    return response.data.data ?? response.data;
  },

  async updateFeature(id: string, data: unknown) {
    const response = await client.put(`/api/v1/product-manager/features/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteFeature(id: string) {
    const response = await client.delete(`/api/v1/product-manager/features/${id}`);
    return response.data.data ?? response.data;
  },

  // Team
  async getTeam(params?: unknown) {
    const response = await client.get('/api/v1/product-manager/team', { params });
    return response.data.data ?? response.data;
  },

  // Analytics
  async getAnalyticsMetrics() {
    const response = await client.get('/api/v1/product-manager/analytics/metrics');
    return response.data.data ?? response.data;
  },

  // Reports
  async getReports() {
    const response = await client.get('/api/v1/product-manager/reports');
    return response.data.data ?? response.data;
  },

  async generateReport(reportId: string, format: 'json' | 'csv' = 'json') {
    const response = await client.get(`/api/v1/product-manager/reports/${reportId}`, { params: { format } });
    return response.data.data ?? response.data;
  },

  async getFeatureToggles() {
    const response = await client.get('/api/v1/product-manager/settings/features');
    return response.data.data ?? response.data;
  },

  async updateFeatureToggles(data: Record<string, boolean>) {
    const response = await client.put('/api/v1/product-manager/settings/features', data);
    return response.data.data ?? response.data;
  },

  async getPlans() {
    const response = await client.get('/api/v1/product-manager/plans');
    return response.data.data ?? response.data;
  },

  // Maintenance
  async getMaintenanceSchedules(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/product-manager/maintenance', { params });
    return response.data.data ?? response.data;
  },

  async createMaintenanceSchedule(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/product-manager/maintenance', data);
    return response.data.data ?? response.data;
  },

  async updateMaintenanceSchedule(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/product-manager/maintenance/${id}`, data);
    return response.data.data ?? response.data;
  },

  async cancelMaintenanceSchedule(id: number | string) {
    const response = await client.delete(`/api/v1/product-manager/maintenance/${id}`);
    return response.data.data ?? response.data;
  },

  async createPlan(data: Omit<SubscriptionPlan, 'id'>) {
    const response = await client.post('/api/v1/product-manager/plans', data);
    return response.data.data ?? response.data;
  },

  async updatePlan(id: string, data: Partial<SubscriptionPlan>) {
    const response = await client.put(`/api/v1/product-manager/plans/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deletePlan(id: string) {
    const response = await client.delete(`/api/v1/product-manager/plans/${id}`);
    return response.data.data ?? response.data;
  }
};
