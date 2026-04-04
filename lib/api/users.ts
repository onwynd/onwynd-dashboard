import client from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: { name: string }[];
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  student_verification_status?: 'pending' | 'approved' | 'rejected' | null;
  student_email?: string;
  student_id_document?: string;
  institution_name?: string;
  location?: string;
  document_verification_status?: 'pending' | 'approved' | 'rejected' | null;
  custom_ai_messages?: number | null;
  custom_daily_activities?: number | null;
  grace_period_days?: number;
  has_unlimited_quota?: boolean;
  quota_override_expires_at?: string | null;
}

export interface UserQuota {
  user: {
    custom_ai_messages: number | null;
    custom_daily_activities: number | null;
    grace_period_days: number;
    has_unlimited_quota: boolean;
    quota_override_expires_at: string | null;
  };
  usage: {
    ai_messages_today: number;
    activities_today: number;
  };
  global_defaults: {
    free_daily_activities: number;
    free_ai_messages: number;
    new_user_ai_messages: number;
    new_user_days: number;
    distress_extension_messages: number;
    abuse_cap_messages: number;
  };
}

export interface UserResponse {
  data: User[];
  current_page: number;
  last_page: number;
  total: number;
}

export const usersService = {
  async getUsers(params?: { page?: number; search?: string; role?: string; institution_type?: 'school' | 'company' | 'all' }) {
    const response = await client.get('/api/v1/admin/users', { params });
    return response.data.data ?? response.data;
  },

  async getUser(id: number) {
    const response = await client.get(`/api/v1/admin/users/${id}`);
    return response.data.data ?? response.data;
  },

  async createUser(data: Partial<User> & { password?: string }) {
    const response = await client.post('/api/v1/admin/users', data);
    return response.data.data ?? response.data;
  },

  async updateUser(id: number, data: Partial<User>) {
    const response = await client.put(`/api/v1/admin/users/${id}`, data);
    return response.data.data ?? response.data;
  },

  async suspendUser(id: number, reason?: string) {
    const response = await client.post(`/api/v1/admin/users/${id}/suspend`, { reason });
    return response.data.data ?? response.data;
  },

  async activateUser(id: number) {
    const response = await client.post(`/api/v1/admin/users/${id}/activate`);
    return response.data.data ?? response.data;
  },

  async deleteUser(id: number) {
    const response = await client.delete(`/api/v1/admin/users/${id}`);
    return response.data.data ?? response.data;
  },

  async verifyStudent(userId: number, verificationData: {
    student_verification_status: 'approved' | 'rejected';
    student_email?: string;
    institution_name?: string;
    rejection_reason?: string;
  }) {
    const response = await client.post(`/api/v1/admin/users/${userId}/verify-student`, verificationData);
    return response.data.data ?? response.data;
  },

  async getStudentVerifications(params?: { status?: 'pending' | 'approved' | 'rejected'; page?: number }) {
    const response = await client.get('/api/v1/admin/student-verifications', { params });
    return response.data.data ?? response.data;
  },

  async getUserQuota(userId: number): Promise<UserQuota> {
    const response = await client.get(`/api/v1/admin/users/${userId}/quota`);
    return response.data.data ?? response.data;
  },

  async updateUserQuota(userId: number, quotaData: {
    custom_ai_messages?: number | null;
    custom_daily_activities?: number | null;
    grace_period_days?: number;
    has_unlimited_quota?: boolean;
    quota_override_expires_at?: string | null;
  }): Promise<UserQuota['user']> {
    const response = await client.put(`/api/v1/admin/users/${userId}/quota`, quotaData);
    return response.data.data ?? response.data;
  },

  async resetUserQuota(userId: number): Promise<{ message: string; user_id: number; reset_date: string }> {
    const response = await client.post(`/api/v1/admin/users/${userId}/quota/reset`);
    return response.data.data ?? response.data;
  }
};
