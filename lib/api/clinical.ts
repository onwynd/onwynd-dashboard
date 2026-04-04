import client from './client';

export const clinicalService = {
  // Session Reviews (Audit)
  async getReviews(params?: Record<string, any>) {
    const response = await client.get('/api/v1/clinical-advisor/reviews', { params });
    return response.data;
  },

  async getReview(id: string) {
    const response = await client.get(`/api/v1/clinical-advisor/reviews/${id}`);
    return response.data;
  },

  async approveReview(id: string, notes?: string) {
    const response = await client.post(`/api/v1/clinical-advisor/reviews/${id}/approve`, { notes });
    return response.data;
  },

  async flagReview(id: string, reason: string, priority: string = 'normal') {
    const response = await client.post(`/api/v1/clinical-advisor/reviews/${id}/flag`, { reason, priority });
    return response.data;
  },

  async escalateReview(id: string, reason: string) {
    const response = await client.post(`/api/v1/clinical-advisor/reviews/${id}/escalate`, { reason });
    return response.data;
  },

  // Distress Queue (Real-time AI monitoring)
  async getDistressQueue(page = 1) {
    const response = await client.get(`/api/v1/clinical-advisor/distress-queue?page=${page}`);
    return response.data;
  },

  async resolveDistressItem(id: string, resolution_type: string, notes?: string) {
    const response = await client.patch(`/api/v1/clinical-advisor/distress-queue/${id}/resolve`, { 
      resolution_type, 
      notes 
    });
    return response.data;
  },

  // Meeting Invites
  async sendMeetingInvite(therapistId: string) {
    const response = await client.post(`/api/v1/clinical-advisor/therapists/${therapistId}/meeting-invite`);
    return response.data;
  }
};
