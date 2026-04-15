import client from './client';

// ── Core preferences (all authenticated users) ────────────────────────────
export interface NotificationPreferences {
  session_reminders:  { email?: boolean; push?: boolean; whatsapp?: boolean; in_app?: boolean };
  wellbeing_checkins: { push?: boolean; in_app?: boolean };
  new_messages:       { push?: boolean; in_app?: boolean };
  payment_receipts:   { email?: boolean; in_app?: boolean };
  platform_updates:   { email?: boolean; in_app?: boolean };
  promotional:        { email?: boolean };

  // Clinical roles: clinical_advisor, therapist (severity threshold is server-side)
  distress_alerts?:   { email?: boolean; in_app?: boolean; severity_threshold?: 'any' | 'medium' | 'high' | 'critical' };

  // Institutional roles: institution_admin, university_admin, hr
  org_credits?:       { email?: boolean; in_app?: boolean };
  member_distress?:   { email?: boolean; in_app?: boolean; severity_threshold?: 'any' | 'medium' | 'high' | 'critical' };
}

// Which roles see which extra categories
export const ROLE_EXTRA_CATEGORIES: Record<string, Array<keyof NotificationPreferences>> = {
  clinical_advisor:  ['distress_alerts'],
  therapist:         ['distress_alerts'],
  institution_admin: ['member_distress', 'org_credits'],
  university_admin:  ['member_distress', 'org_credits'],
  corporate_hr:      ['member_distress', 'org_credits'],
  admin:             ['distress_alerts'],
  super_admin:       ['distress_alerts'],
  coo:               ['distress_alerts', 'org_credits'],
  ceo:               ['distress_alerts', 'org_credits'],
};

export const userService = {
  async updateProfile(data: Record<string, unknown>) {
    const response = await client.put('/api/v1/user/profile', data);
    return response.data.data ?? response.data;
  },

  async updatePassword(data: Record<string, unknown>) {
    const response = await client.post('/api/v1/user/password/change', data);
    return response.data.data ?? response.data;
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await client.get('/api/v1/notifications/preferences');
    return response.data.data ?? response.data;
  },

  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await client.put('/api/v1/notifications/preferences', { preferences: prefs });
    return response.data.data ?? response.data;
  },

  // ── Shared in-app notification bell (all roles) ───────────────────────────
  async getNotifications(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/notifications/', { params });
    return response.data.data ?? response.data;
  },

  async getUnreadNotificationCount(): Promise<number> {
    const response = await client.get('/api/v1/notifications/unread-count');
    const data = response.data.data ?? response.data;
    return typeof data?.count === 'number' ? data.count : (typeof data === 'number' ? data : 0);
  },

  async markNotificationRead(id: string | number) {
    const response = await client.patch(`/api/v1/notifications/${id}/read`);
    return response.data.data ?? response.data;
  },

  async markAllNotificationsRead() {
    const response = await client.patch('/api/v1/notifications/read-all');
    return response.data.data ?? response.data;
  },

  async deleteNotification(id: string | number) {
    await client.delete(`/api/v1/notifications/${id}`);
  },
};
