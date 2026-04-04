import client from './client';

export interface SecretaryStats {
  todayAppointments: number;
  activeVisitors: number;
  pendingRequests: number;
  doctorsAvailable: number;
}

export interface Appointment {
  id: number;
  title: string;
  patient_name: string;
  doctor_name: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface Visitor {
  id: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  host: string;
  check_in_time: string;
  check_out_time: string | null;
  status: "checked_in" | "checked_out";
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  type: string;
  description?: string;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedDate: string;
  avatar: string | null;
}

export interface SecretaryTaskDTO {
  id: number | string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  due_date?: string | null;
}

export interface SecretaryPersonDTO {
  id: number | string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string | null;
}

export interface SecretaryDocumentDTO {
  id: number | string;
  name: string;
  type?: string;
  size?: string;
  date?: string;
  url?: string;
  icon?: string;
  author?: string;
  authorAvatar?: string | null;
  uploadedAt?: string;
}

export interface SecretaryChartPointDTO {
  name: string;
  value?: number;
  count?: number;
}

export const secretaryService = {
  // Stats
  async getStats() {
    const response = await client.get('/api/v1/secretary/stats');
    return response.data.data ?? response.data;
  },

  // Appointments
  async getAppointments(params?: { search?: string; date?: string }) {
    const response = await client.get('/api/v1/secretary/appointments', { params });
    return response.data.data ?? response.data;
  },

  async createAppointment(data: Omit<Appointment, 'id'>) {
    const response = await client.post('/api/v1/secretary/appointments', data);
    return response.data.data ?? response.data;
  },

  async updateAppointment(id: number, data: Partial<Appointment>) {
    const response = await client.put(`/api/v1/secretary/appointments/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteAppointment(id: number) {
    const response = await client.delete(`/api/v1/secretary/appointments/${id}`);
    return response.data.data ?? response.data;
  },

  // Visitors
  async getVisitors(params?: { search?: string }) {
    const response = await client.get('/api/v1/secretary/visitors', { params });
    return response.data.data ?? response.data;
  },

  async createVisitor(data: Omit<Visitor, 'id' | 'check_out_time' | 'status' | 'created_at'>) {
    const response = await client.post('/api/v1/secretary/visitors', data);
    return response.data.data ?? response.data;
  },

  async checkoutVisitor(id: number) {
    const response = await client.post(`/api/v1/secretary/visitors/${id}/checkout`);
    return response.data.data ?? response.data;
  },

  async deleteVisitor(id: number) {
    const response = await client.delete(`/api/v1/secretary/visitors/${id}`);
    return response.data.data ?? response.data;
  },

  async updateVisitor(id: number, data: Partial<Visitor>) {
    const response = await client.put(`/api/v1/secretary/visitors/${id}`, data);
    return response.data.data ?? response.data;
  },

  // Calendar
  async getCalendarEvents(params?: { start_date: string; end_date: string }) {
    const response = await client.get('/api/v1/secretary/calendar', { params });
    return response.data.data ?? response.data;
  },

  // Patients
  async getPatients(params?: { search?: string }) {
    const response = await client.get('/api/v1/secretary/patients', { params });
    return response.data.data ?? response.data;
  },
  
  async createPatient(data: Omit<Patient, 'id' | 'status' | 'joinedDate' | 'avatar'> & { password?: string, first_name?: string, last_name?: string, phone_number?: string }) {
    const response = await client.post('/api/v1/secretary/patients', data);
    return response.data.data ?? response.data;
  },
  
  async updatePatient(id: number, data: Partial<Patient> & { password?: string, first_name?: string, last_name?: string, phone_number?: string }) {
    const response = await client.put(`/api/v1/secretary/patients/${id}`, data);
    return response.data.data ?? response.data;
  },

  async getTasks(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/secretary/tasks', { params });
    return response.data.data ?? response.data;
  },

  async getPeople(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/secretary/people', { params });
    return response.data.data ?? response.data;
  },

  async getDocuments(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/secretary/documents', { params });
    return response.data.data ?? response.data;
  },

  async getChartData(period?: string) {
    const response = await client.get('/api/v1/secretary/chart-data', { params: { period } });
    return response.data.data ?? response.data;
  }
};
