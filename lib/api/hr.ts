import client from './client';
import { parseApiResponse } from './utils';

export const hrService = {
  // Dashboard
  async getDashboard() {
    const response = await client.get('/api/v1/hr/dashboard');
    return parseApiResponse(response);
  },
  
  // Stats
  async getStats() {
    const response = await client.get('/api/v1/hr/stats');
    return parseApiResponse(response);
  },

  // Employees CRUD
  async getEmployees(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/employees', { params });
    return parseApiResponse(response);
  },

  async getEmployee(id: string | number) {
    const response = await client.get(`/api/v1/hr/employees/${id}`);
    return parseApiResponse(response);
  },

  async createEmployee(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/hr/employees', data);
    return parseApiResponse(response);
  },

  async updateEmployee(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/hr/employees/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteEmployee(id: string | number) {
    const response = await client.delete(`/api/v1/hr/employees/${id}`);
    return parseApiResponse(response);
  },

  // Payroll
  async getPayroll(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/payroll', { params });
    return parseApiResponse(response);
  },

  async createPayroll(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/hr/payroll', data);
    return parseApiResponse(response);
  },

  async markPayrollPaid(uuid: string) {
    const response = await client.post(`/api/v1/hr/payroll/${uuid}/mark-paid`);
    return parseApiResponse(response);
  },

  async processPayroll(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/hr/payroll/process', data);
    return parseApiResponse(response);
  },
  async getPayrolls(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/payroll', { params });
    return parseApiResponse(response);
  },

  // Leave Management
  async getLeaves(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/leaves', { params });
    return parseApiResponse(response);
  },
  // /hr/leaves/requests does not exist — use the main leaves endpoint with a status filter
  async getLeaveRequests(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/leaves', { params: { status: 'pending', ...params } });
    return parseApiResponse(response);
  },

  // Charts
  async getChartData(period: string) {
    const response = await client.get('/api/v1/hr/financial-flow', { params: { period } });
    return parseApiResponse(response);
  },

  async updateLeave(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/hr/leaves/${id}`, data);
    return parseApiResponse(response);
  },

  // Job Applications
  async getJobApplications(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/hr/job-applications', { params });
    return parseApiResponse(response);
  },

  async getRecentJobApplications() {
    const response = await client.get('/api/v1/hr/job-applications/recent');
    return parseApiResponse(response);
  },

  async getJobApplication(uuid: string) {
    const response = await client.get(`/api/v1/hr/careers/applications/${uuid}`);
    return parseApiResponse(response);
  },

  async updateJobApplication(uuid: string, data: Record<string, unknown>) {
    const response = await client.patch(`/api/v1/hr/careers/applications/${uuid}`, data);
    return parseApiResponse(response);
  },

  /**
   * Onboard an accepted applicant — creates a user account with the selected role
   * and sends them an invite email. Returns the new user record.
   */
  async onboardApplicant(uuid: string, data: { role: string; department?: string; send_invite?: boolean }) {
    const response = await client.post(`/api/v1/hr/careers/applications/${uuid}/onboard`, data);
    return parseApiResponse(response);
  },

  // Benefits
  async getBenefits() {
    const response = await client.get('/api/v1/hr/benefits');
    return parseApiResponse(response);
  },

  async createBenefit(data: { title: string; description?: string; icon?: string; status?: string; enrolled_count?: number }) {
    const response = await client.post('/api/v1/hr/benefits', data);
    return parseApiResponse(response);
  },

  async updateBenefit(id: number, data: Partial<{ title: string; description: string; icon: string; status: string; enrolled_count: number }>) {
    const response = await client.put(`/api/v1/hr/benefits/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteBenefit(id: number) {
    const response = await client.delete(`/api/v1/hr/benefits/${id}`);
    return parseApiResponse(response);
  },
};
