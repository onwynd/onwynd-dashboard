/**
 * Support Live Chat Store
 *
 * Manages two views:
 *  - Customer: a single active session (`activeChat` + `messages`)
 *  - Agent:    a list of all open chats (`agentChats`) + selected session
 */
import { create } from 'zustand';
import { supportChatService, type ChatMessage, type SupportChat, type ChatStatus } from '@/lib/api/support-chat';
import { getEcho, disconnectEcho } from '@/lib/echo';

// ─── State shape ──────────────────────────────────────────────────────────────

interface SupportChatState {
  // Customer side
  activeChatUuid: string | null;
  activeChat: SupportChat | null;
  messages: ChatMessage[];
  status: ChatStatus | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Agent side
  agentChats: SupportChat[];
  selectedChatUuid: string | null;
  selectedMessages: ChatMessage[];

  // Actions — customer
  startChat: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  closeChat: () => Promise<void>;
  loadChat: (uuid: string) => Promise<void>;

  // Actions — agent
  loadActiveChats: () => Promise<void>;
  selectChat: (uuid: string) => Promise<void>;
  agentReply: (text: string) => Promise<void>;
  handover: (uuid: string) => Promise<void>;
  release: (uuid: string) => Promise<void>;

  // WebSocket
  subscribeToChat: (uuid: string) => void;
  subscribeToAgentChannel: () => void;
  unsubscribeAll: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSupportChatStore = create<SupportChatState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  activeChatUuid: null,
  activeChat: null,
  messages: [],
  status: null,
  isLoading: false,
  isSending: false,
  error: null,

  agentChats: [],
  selectedChatUuid: null,
  selectedMessages: [],

  // ── Customer actions ───────────────────────────────────────────────────────

  startChat: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await supportChatService.start();
      set({
        activeChatUuid: data.chat_uuid,
        status: data.status,
        messages: data.messages,
        isLoading: false,
      });
      get().subscribeToChat(data.chat_uuid);
    } catch (e) {
      set({ isLoading: false, error: 'Could not start chat. Please try again.' });
    }
  },

  sendMessage: async (text: string) => {
    const { activeChatUuid } = get();
    if (!activeChatUuid || !text.trim()) return;

    const optimistic: ChatMessage = {
      id: Date.now(),
      sender_type: 'user',
      sender_id: null,
      message: text.trim(),
      metadata: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, optimistic], isSending: true }));

    try {
      const data = await supportChatService.sendMessage(activeChatUuid, text);
      // Replace optimistic + add ai_reply from response
      set((s) => {
        const confirmed = s.messages.filter((m) => m.id !== optimistic.id);
        confirmed.push(data.user_message);
        if (data.ai_reply) confirmed.push(data.ai_reply);
        return { messages: confirmed, status: data.status, isSending: false };
      });
    } catch {
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== optimistic.id),
        isSending: false,
        error: 'Message failed. Please try again.',
      }));
    }
  },

  closeChat: async () => {
    const { activeChatUuid } = get();
    if (!activeChatUuid) return;
    await supportChatService.close(activeChatUuid);
    get().unsubscribeAll();
    set({ activeChatUuid: null, activeChat: null, messages: [], status: 'closed' });
  },

  loadChat: async (uuid: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await supportChatService.getChat(uuid);
      set({
        activeChatUuid: uuid,
        activeChat: data.chat,
        messages: data.messages,
        status: data.chat.status,
        isLoading: false,
      });
      get().subscribeToChat(uuid);
    } catch {
      set({ isLoading: false, error: 'Could not load chat.' });
    }
  },

  // ── Agent actions ──────────────────────────────────────────────────────────

  loadActiveChats: async () => {
    try {
      const data = await supportChatService.activeChats();
      const chats = Array.isArray(data) ? data : (data as { data: SupportChat[] }).data ?? [];
      set({ agentChats: chats });
    } catch {
      // silent — polling can retry
    }
  },

  selectChat: async (uuid: string) => {
    set({ selectedChatUuid: uuid, selectedMessages: [], isLoading: true });
    try {
      const data = await supportChatService.getChat(uuid);
      set({ selectedMessages: data.messages, isLoading: false });
      get().subscribeToChat(uuid);
    } catch {
      set({ isLoading: false });
    }
  },

  agentReply: async (text: string) => {
    const { selectedChatUuid } = get();
    if (!selectedChatUuid || !text.trim()) return;
    set({ isSending: true });
    try {
      const msg = await supportChatService.agentReply(selectedChatUuid, text);
      set((s) => ({ selectedMessages: [...s.selectedMessages, msg], isSending: false }));
    } catch {
      set({ isSending: false });
    }
  },

  handover: async (uuid: string) => {
    await supportChatService.handover(uuid);
    // Refresh agent chat list so the status badge updates
    get().loadActiveChats();
  },

  release: async (uuid: string) => {
    await supportChatService.release(uuid);
    get().loadActiveChats();
  },

  // ── WebSocket ──────────────────────────────────────────────────────────────

  subscribeToChat: (uuid: string) => {
    const echo = getEcho();
    if (!echo) return;

    echo
      .private(`support.chat.${uuid}`)
      .listen('.support.message', (e: unknown) => {
        const { message } = e as { message: ChatMessage };
        // Append incoming message (deduplicate by id)
        set((s) => {
          const isCustomerView = s.activeChatUuid === uuid;
          const isAgentView = s.selectedChatUuid === uuid;

          if (isCustomerView) {
            const exists = s.messages.some((m) => m.id === message.id);
            if (exists) return {};
            return { messages: [...s.messages, message] };
          }
          if (isAgentView) {
            const exists = s.selectedMessages.some((m) => m.id === message.id);
            if (exists) return {};
            return { selectedMessages: [...s.selectedMessages, message] };
          }
          return {};
        });
      })
      .listen('.support.handover', (e: unknown) => {
        const { status } = e as { status: ChatStatus };
        set((s) => {
          if (s.activeChatUuid === uuid) return { status };
          return {};
        });
        // Refresh agent list on any handover event
        get().loadActiveChats();
      });
  },

  subscribeToAgentChannel: () => {
    const echo = getEcho();
    if (!echo) return;

    echo.private('support.agents').listen('.support.handover', () => {
      // A chat changed status — refresh the full list
      get().loadActiveChats();
    });
  },

  unsubscribeAll: () => {
    disconnectEcho();
  },
}));
