import client from './client';

export const employeeService = {
  // Dashboard
  async getDashboard() {
    const response = await client.get('/api/v1/employee/dashboard');
    return response.data.data ?? response.data;
  },
  
  // Stats
  async getStats() {
    const response = await client.get('/api/v1/employee/stats');
    return response.data.data ?? response.data;
  },

  // Tasks CRUD
  async getTasks(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/employee/tasks', { params });
    return response.data.data ?? response.data;
  },

  async getTask(id: string | number) {
    const response = await client.get(`/api/v1/employee/tasks/${id}`);
    return response.data.data ?? response.data;
  },

  async createTask(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/employee/tasks', data);
    return response.data.data ?? response.data;
  },

  async updateTask(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/employee/tasks/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteTask(id: string | number) {
    const response = await client.delete(`/api/v1/employee/tasks/${id}`);
    return response.data.data ?? response.data;
  },

  // Timesheet
  async getTimesheet(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/employee/timesheet', { params });
    return response.data.data ?? response.data;
  },

  async submitTimesheet(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/employee/timesheet', data);
    return response.data.data ?? response.data;
  },

  // Clock In/Out
  async clockIn() {
    const response = await client.post('/api/v1/employee/clock-in');
    return response.data.data ?? response.data;
  },

  async clockOut() {
    const response = await client.post('/api/v1/employee/clock-out');
    return response.data.data ?? response.data;
  },

  // People
  async getPeople(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/employee/people', { params });
    return response.data.data ?? response.data;
  },

  // Documents
  async getRecentDocuments(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/employee/documents', { params });
    return response.data.data ?? response.data;
  },

  // Charts
  async getChartData(period: string) {
    const response = await client.get('/api/v1/employee/chart-data', { params: { period } });
    return response.data.data ?? response.data;
  },
};
