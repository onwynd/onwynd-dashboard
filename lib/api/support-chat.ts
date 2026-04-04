import client from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatStatus = 'ai' | 'waiting' | 'human' | 'closed';
export type SenderType = 'user' | 'ai' | 'agent' | 'system';

export interface ChatMessage {
  id: number;
  sender_type: SenderType;
  sender_id: number | null;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface SupportChat {
  uuid: string;
  status: ChatStatus;
  user_context: Record<string, unknown> | null;
  assigned_agent_id: number | null;
  handover_at: string | null;
  created_at: string;
  user?: { id: number; first_name: string; last_name: string; email: string; profile_photo?: string };
  assigned_agent?: { id: number; first_name: string; last_name: string; profile_photo?: string };
  latest_message?: ChatMessage;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const supportChatService = {
  /** Start a new support chat session (customer) */
  async start(): Promise<{ chat_uuid: string; status: ChatStatus; messages: ChatMessage[] }> {
    const res = await client.post('/api/v1/support/chats/start');
    return res.data.data ?? res.data;
  },

  /** Send a message in an existing chat (customer) */
  async sendMessage(uuid: string, message: string): Promise<{
    user_message: ChatMessage;
    ai_reply?: ChatMessage;
    status: ChatStatus;
  }> {
    const res = await client.post(`/api/v1/support/chats/${uuid}/message`, { message });
    return res.data.data ?? res.data;
  },

  /** Get a chat with its full message history */
  async getChat(uuid: string): Promise<{ chat: SupportChat; messages: ChatMessage[] }> {
    const res = await client.get(`/api/v1/support/chats/${uuid}`);
    return res.data.data ?? res.data;
  },

  /** Close a chat session (customer or agent) */
  async close(uuid: string): Promise<void> {
    await client.post(`/api/v1/support/chats/${uuid}/close`);
  },

  // ── Agent endpoints ───────────────────────────────────────────────────────

  /** List all active chats for the agent panel */
  async activeChats(page = 1): Promise<{ data: SupportChat[]; meta: Record<string, unknown> }> {
    const res = await client.get('/api/v1/support/chats/active', { params: { page } });
    return res.data.data ?? res.data;
  },

  /** Agent sends a reply */
  async agentReply(uuid: string, message: string): Promise<ChatMessage> {
    const res = await client.post(`/api/v1/support/chats/${uuid}/agent-reply`, { message });
    return res.data.data ?? res.data;
  },

  /** Agent claims the chat (AI stops, human takes over) */
  async handover(uuid: string): Promise<{ chat_uuid: string; status: string; agent_name: string }> {
    const res = await client.post(`/api/v1/support/chats/${uuid}/handover`);
    return res.data.data ?? res.data;
  },

  /** Agent releases the chat back to AI */
  async release(uuid: string): Promise<void> {
    await client.post(`/api/v1/support/chats/${uuid}/release`);
  },
};
