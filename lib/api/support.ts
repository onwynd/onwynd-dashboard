import client from './client';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category_id: number;
  category?: Category;
  author_id: number;
  author?: {
    id: number;
    name: string;
  };
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'corporate';
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  order: number;
  type: 'public' | 'internal' | 'corporate';
  created_at: string;
  updated_at: string;
}

export const supportService = {
  async getStats() {
    const response = await client.get('/api/v1/support/stats');
    return response.data.data ?? response.data;
  },

  async getTickets(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/support/tickets', { params });
    return response.data.data ?? response.data;
  },

  async getTicketById(id: string) {
    const response = await client.get(`/api/v1/support/tickets/${id}`);
    return response.data.data ?? response.data;
  },

  async updateTicket(id: number, data: { status?: 'open' | 'in_progress' | 'resolved' | 'closed'; priority?: 'low' | 'medium' | 'high' | 'urgent'; assigned_to?: number | null }) {
    const response = await client.put(`/api/v1/support/tickets/${id}`, data);
    return response.data.data ?? response.data;
  },

  async getSupportAgents() {
    const response = await client.get('/api/v1/admin/users', { params: { role: 'support' } });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  },

  async createTicket(data: { subject: string; description: string; priority?: string }) {
    const response = await client.post('/api/v1/support/tickets', data);
    return response.data.data ?? response.data;
  },

  // Knowledge Base
  async getArticles(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/knowledge-base/articles', { params });
    return response.data.data ?? response.data;
  },

  async getArticle(id: string | number) {
    const response = await client.get(`/api/v1/knowledge-base/articles/${id}`);
    return response.data.data ?? response.data;
  },

  async createArticle(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/knowledge-base/articles', data);
    return response.data.data ?? response.data;
  },

  async updateArticle(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/knowledge-base/articles/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteArticle(id: string | number) {
    const response = await client.delete(`/api/v1/knowledge-base/articles/${id}`);
    return response.data.data ?? response.data;
  },

  async getCategories() {
    const response = await client.get('/api/v1/knowledge-base/categories');
    return response.data.data ?? response.data;
  }
};
