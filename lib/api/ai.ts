import client from './client';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string | number;
  created_at?: string;
}

export interface AiConversation {
  id: string | number;
  title?: string;
  messages: AiMessage[];
  created_at: string;
  updated_at: string;
}

export interface AiQuota {
  used: number;
  limit: number;
  remaining: number;
  reset_at?: string;
}

export interface AiChatPayload {
  message: string;
  conversation_id?: string | number;
  context?: string;
}

export interface AiChatResponse {
  reply: string;
  conversation_id: string | number;
  message_id?: string | number;
}

export interface CompanionNotes {
  hobbies?: string[];
  food?: string[];
  activities?: string[];
  [key: string]: unknown;
}

export const aiService = {
  /**
   * Get current AI quota usage.
   * GET /api/v1/ai/quota
   */
  async getQuota(): Promise<AiQuota> {
    const response = await client.get('/api/v1/ai/quota');
    return response.data.data ?? response.data;
  },

  /**
   * Send a message to the AI companion.
   * POST /api/v1/ai/chat
   */
  async chat(payload: AiChatPayload): Promise<AiChatResponse> {
    const response = await client.post('/api/v1/ai/chat', payload);
    return response.data.data ?? response.data;
  },

  /**
   * List all AI conversations for the authenticated user.
   * GET /api/v1/ai/conversations
   */
  async getConversations(): Promise<AiConversation[]> {
    const response = await client.get('/api/v1/ai/conversations');
    return response.data.data ?? response.data;
  },

  /**
   * Get a conversation and its message history.
   * GET /api/v1/ai/conversations/{id}
   */
  async getConversation(id: string | number): Promise<AiConversation> {
    const response = await client.get(`/api/v1/ai/conversations/${id}`);
    return response.data.data ?? response.data;
  },

  /**
   * Delete a conversation.
   * DELETE /api/v1/ai/conversations/{id}
   */
  async deleteConversation(id: string | number): Promise<void> {
    await client.delete(`/api/v1/ai/conversations/${id}`);
  },

  /**
   * Submit thumbs-up / thumbs-down feedback on a message.
   * POST /api/v1/ai/chats/{id}/feedback
   */
  async sendFeedback(messageId: string | number, feedback: 'positive' | 'negative'): Promise<void> {
    await client.post(`/api/v1/ai/chats/${messageId}/feedback`, { feedback });
  },

  /**
   * Run an AI diagnostic session.
   * POST /api/v1/ai/diagnostic/start
   */
  async startDiagnostic(data?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await client.post('/api/v1/ai/diagnostic/start', data ?? {});
    return response.data.data ?? response.data;
  },

  /**
   * Send a message within an active diagnostic session.
   * POST /api/v1/ai/diagnostic/{sessionId}/message
   */
  async sendDiagnosticMessage(sessionId: string | number, message: string): Promise<Record<string, unknown>> {
    const response = await client.post(`/api/v1/ai/diagnostic/${sessionId}/message`, { message });
    return response.data.data ?? response.data;
  },

  /**
   * Get a diagnostic session.
   * GET /api/v1/ai/diagnostic/{sessionId}
   */
  async getDiagnosticSession(sessionId: string | number): Promise<Record<string, unknown>> {
    const response = await client.get(`/api/v1/ai/diagnostic/${sessionId}`);
    return response.data.data ?? response.data;
  },

  /**
   * Transcribe an audio file.
   * POST /api/v1/ai/transcribe
   */
  async transcribe(formData: FormData): Promise<{ transcript: string }> {
    const response = await client.post('/api/v1/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data ?? response.data;
  },

  /**
   * Extract text from a document or describe an image.
   * POST /api/v1/ai/analyze-document
   */
  async analyzeDocument(formData: FormData): Promise<Record<string, unknown>> {
    const response = await client.post('/api/v1/ai/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data ?? response.data;
  },

  /**
   * Get companion personal notes (learned from chat interactions).
   * GET /api/v1/ai/companion/notes
   */
  async getCompanionNotes(): Promise<CompanionNotes> {
    const response = await client.get('/api/v1/ai/companion/notes');
    return response.data.data ?? response.data;
  },

  /**
   * Update companion personal notes.
   * PATCH /api/v1/ai/companion/notes
   */
  async updateCompanionNotes(notes: Partial<CompanionNotes>): Promise<CompanionNotes> {
    const response = await client.patch('/api/v1/ai/companion/notes', notes);
    return response.data.data ?? response.data;
  },
};
