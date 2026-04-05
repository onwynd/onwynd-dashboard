import client from './client';
import { parseApiResponse } from './utils';

export const therapistService = {
  async getDashboard() {
    const response = await client.get('/api/v1/therapist/dashboard', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async getStats() {
    const response = await client.get('/api/v1/therapist/stats', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async getFinancialFlow(period: string = 'monthly') {
    const response = await client.get('/api/v1/therapist/financial-flow', { params: { period }, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async getPatients(params?: unknown) {
    const response = await client.get('/api/v1/therapist/patients', { params, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async createPatient(data: unknown) {
    const response = await client.post('/api/v1/therapist/patients', data);
    return parseApiResponse(response);
  },

  async updatePatient(id: number | string, data: unknown) {
    const response = await client.put(`/api/v1/therapist/patients/${id}`, data);
    return parseApiResponse(response);
  },

  async deletePatient(id: number | string) {
    const response = await client.delete(`/api/v1/therapist/patients/${id}`);
    return parseApiResponse(response);
  },

  async importPatients(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/api/v1/therapist/patients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },

  async getProfile() {
    const response = await client.get('/api/v1/therapist/profile', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async updateProfile(data: Record<string, unknown>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    const response = await client.put('/api/v1/therapist/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },

  async uploadCertificate(file: File) {
    const formData = new FormData();
    formData.append('certificate', file);
    // DB11: use dedicated certificate endpoint, not the profile PUT
    const response = await client.post('/api/v1/therapist/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseApiResponse(response);
  },

  async getSessions(params?: unknown) {
    const response = await client.get('/api/v1/therapist/sessions', { params, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async updateReferralStatus(id: string | number, status: string) {
    // DB12: therapist referrals live under /therapist namespace
    const response = await client.patch(`/api/v1/therapist/referrals/${id}`, { status });
    return parseApiResponse(response);
  },

  async getEarnings(params?: unknown) {
    const response = await client.get('/api/v1/therapist/earnings', { params, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async getNotes(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/therapist/notes', { params, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async createNote(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/therapist/notes', data);
    return parseApiResponse(response);
  },

  async updateNote(id: number | string, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/therapist/notes/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteNote(id: number | string) {
    const response = await client.delete(`/api/v1/therapist/notes/${id}`);
    return parseApiResponse(response);
  },

  async getNotifications(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/therapist/notifications', { params, suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async getUnreadNotificationCount() {
    const response = await client.get('/api/v1/therapist/notifications/unread-count', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async markNotificationRead(id?: string | number) {
    if (id) {
      const response = await client.patch(`/api/v1/therapist/notifications/${id}/read`);
      return parseApiResponse(response);
    }
    const response = await client.patch('/api/v1/therapist/notifications/read-all');
    return parseApiResponse(response);
  },

  async getAvailability() {
    const response = await client.get('/api/v1/therapist/availability', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async createAvailability(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/therapist/availability', data);
    return parseApiResponse(response);
  },

  async updateAvailability(id: string | number, data: Record<string, unknown>) {
    const response = await client.put(`/api/v1/therapist/availability/${id}`, data);
    return parseApiResponse(response);
  },

  async deleteAvailability(id: string | number) {
    const response = await client.delete(`/api/v1/therapist/availability/${id}`);
    return parseApiResponse(response);
  },

  async acceptTerms() {
    const response = await client.patch('/api/v1/therapist/terms/accept');
    return parseApiResponse(response);
  },

  //  Bank Account (Feature 1) 
  async getBankAccount() {
    const response = await client.get('/api/v1/therapist/profile', { suppressErrorToast: true });
    return response.data?.data?.bank_details ?? null;
  },

  async saveBankAccount(data: Record<string, unknown>) {
    const response = await client.put('/api/v1/therapist/bank-details', data);
    return response.data?.data ?? response.data;
  },

  // ─── Patient Invites ─────────────────────────────────────────────────────────

  async invitePatient(email: string, message?: string) {
    const response = await client.post('/api/v1/therapist/patient-invites', { email, message });
    return parseApiResponse(response);
  },

  async getPatientInvites() {
    const response = await client.get('/api/v1/therapist/patient-invites', { suppressErrorToast: true });
    return parseApiResponse(response);
  },

  async revokePatientInvite(id: number) {
    const response = await client.delete(`/api/v1/therapist/patient-invites/${id}`);
    return parseApiResponse(response);
  },

  //  Payouts (Feature 1 & 4)
  async requestPayout(amount: number) {
    const response = await client.post('/api/v1/therapist/earnings/payout', { amount });
    return response.data?.data ?? response.data;
  },

  async getPayouts(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/therapist/earnings/payouts', { params, suppressErrorToast: true });
    return response.data?.data ?? response.data;
  },
};

