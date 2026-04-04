import client from './api/client';

// Patient APIs
export const patientApi = {
  // Get patient dashboard
  async getDashboard() {
    const response = await client.get('/api/v1/patient/dashboard');
    return response.data;
  },

  // Get therapist list
  async getTherapists(params?: { specialty?: string; page?: number }) {
    const response = await client.get('/api/v1/therapists', { params });
    return response.data;
  },

  // Get therapist details
  async getTherapist(id: string) {
    const response = await client.get(`/api/v1/therapists/${id}`);
    return response.data;
  },

  // Book session
  async bookSession(data: {
    therapist_id: string;
    scheduled_at: string;
    duration: number;
    type: 'video' | 'audio' | 'chat';
    payment_method: string;
  }) {
    const response = await client.post('/api/v1/sessions/book', data);
    return response.data;
  },

  // Get sessions
  async getSessions(params?: { status?: string; page?: number }) {
    const response = await client.get('/api/v1/patient/sessions', { params });
    return response.data;
  },

  // Get habits
  async getHabits() {
    const response = await client.get('/api/v1/patient/habits');
    return response.data;
  },

  // Create habit
  async createHabit(data: { name: string; frequency: string; goal: number }) {
    const response = await client.post('/api/v1/patient/habits', data);
    return response.data;
  },

  // Check in habit
  async checkInHabit(id: string) {
    const response = await client.post(`/api/v1/patient/habits/${id}/check-in`);
    return response.data;
  },
};
