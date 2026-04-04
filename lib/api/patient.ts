import client from './client';

interface BookSessionPayload {
  therapist_id: string | number;
  scheduled_at: string;    // ISO datetime: "2025-03-10T09:00:00"
  duration: number;        // minutes: 30 | 45 | 60 | 90
  type: 'video' | 'audio' | 'chat';
  payment_method?: string; // "paystack" | "stripe"
  notes?: string;
}

export const patientApi = {
  /**
   * Book a therapy session.
   * POST /api/v1/sessions/book
   */
  async bookSession(payload: BookSessionPayload) {
    const response = await client.post('/api/v1/sessions/book', payload);
    return response.data.data ?? response.data;
  },

  /**
   * Fetch the authenticated patient's upcoming sessions.
   * GET /api/v1/sessions
   */
  async getSessions(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/sessions', { params });
    return response.data.data ?? response.data;
  },

  /**
   * Cancel a session.
   * POST /api/v1/sessions/{id}/cancel
   */
  async cancelSession(sessionId: string | number) {
    const response = await client.post(`/api/v1/sessions/${sessionId}/cancel`);
    return response.data.data ?? response.data;
  },
};
