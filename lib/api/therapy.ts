import client from './client';

export const therapyService = {
  async issueLivekitToken(sessionId: string | number, role: 'publisher' | 'subscriber' | 'moderator' = 'subscriber') {
    const response = await client.post('/api/v1/therapy/video/token', { session_id: sessionId, role });
    return response.data.data ?? response.data;
  },

  async recordConsent(sessionId: string | number, consent: boolean) {
    const response = await client.post('/api/v1/therapy/video/consent', { session_id: sessionId, consent });
    return response.data.data ?? response.data;
  },

  async joinSessionVideo(sessionUuid: string) {
    const response = await client.post(`/api/v1/sessions/${sessionUuid}/video/join`);
    return response.data.data ?? response.data;
  },
};
