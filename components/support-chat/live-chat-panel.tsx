"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  User,
  Clock,
  RefreshCw,
  MessageSquare,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupportChatStore } from "@/store/support-chat-store";
import type { SupportChat } from "@/lib/api/support-chat";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS = {
  ai: { label: "AI", bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
  waiting: { label: "Waiting", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400 animate-pulse" },
  human: { label: "Live", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  closed: { label: "Closed", bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

function StatusBadge({ status }: { status: SupportChat["status"] }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", s.bg, s.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Chat list item ────────────────────────────────────────────────────────────

function ChatListItem({
  chat,
  isSelected,
  onClick,
}: {
  chat: SupportChat;
  isSelected: boolean;
  onClick: () => void;
}) {
  const name = chat.user
    ? `${chat.user.first_name} ${chat.user.last_name}`
    : "Guest";
  const preview = chat.latest_message?.message ?? "No messages yet";
  const time = chat.latest_message
    ? new Date(chat.latest_message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
        isSelected && "bg-indigo-50 border-l-2 border-l-indigo-500"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium truncate max-w-[140px]">{name}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={chat.status} />
          {time && <span className="text-[10px] text-muted-foreground">{time}</span>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground truncate">{preview}</p>
    </button>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export function LiveChatPanel() {
  const {
    agentChats,
    selectedChatUuid,
    selectedMessages,
    isLoading,
    isSending,
    selectChat,
    agentReply,
    handover,
    release,
    loadActiveChats,
  } = useSupportChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  const selectedChat = agentChats.find((c) => c.uuid === selectedChatUuid) ?? null;
  const isHuman = selectedChat?.status === "human";
  const canTakeOver = selectedChat && ["ai", "waiting"].includes(selectedChat.status);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadActiveChats();
    setIsRefreshing(false);
  }

  async function handleHandover() {
    if (!selectedChatUuid) return;
    await handover(selectedChatUuid);
  }

  async function handleRelease() {
    if (!selectedChatUuid) return;
    await release(selectedChatUuid);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── LEFT: Chat list ── */}
      <aside className="w-72 border-r flex flex-col flex-shrink-0 bg-background overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Active Chats ({agentChats.length})
          </span>
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {agentChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">No active chats</p>
            </div>
          ) : (
            agentChats.map((chat) => (
              <ChatListItem
                key={chat.uuid}
                chat={chat}
                isSelected={chat.uuid === selectedChatUuid}
                onClick={() => selectChat(chat.uuid)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── RIGHT: Conversation ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!selectedChat ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a chat to start responding</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-background">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                  {selectedChat.user?.first_name?.[0] ?? "G"}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {selectedChat.user
                      ? `${selectedChat.user.first_name} ${selectedChat.user.last_name}`
                      : "Guest"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={selectedChat.status} />
                    {selectedChat.assigned_agent && (
                      <span className="text-[11px] text-muted-foreground">
                        Assigned: {selectedChat.assigned_agent.first_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handover / Release controls */}
              <div className="flex items-center gap-2">
                {canTakeOver && (
                  <button
                    onClick={handleHandover}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    Take over
                  </button>
                )}
                {isHuman && (
                  <button
                    onClick={handleRelease}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Return to AI
                  </button>
                )}
                {selectedChat.status === "waiting" && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Needs agent
                  </span>
                )}
              </div>
            </div>

            {/* AI mode notice */}
            {selectedChat.status === "ai" && (
              <div className="flex items-center gap-2 px-5 py-2 bg-violet-50 border-b text-xs text-violet-700">
                <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Wynd AI is handling this conversation. Click <strong>Take over</strong> to reply as an agent.</span>
                <ArrowRightLeft className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading && selectedMessages.length === 0 && (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {selectedMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isSending && (
                <div className="flex justify-end mb-3">
                  <div className="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm text-sm opacity-60">
                    Sending…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — only when agent is in control */}
            {isHuman ? (
              <ChatInput
                onSend={agentReply}
                disabled={isSending}
                placeholder="Reply as support agent…"
              />
            ) : (
              <div className="p-3 border-t text-center text-xs text-muted-foreground bg-muted/30">
                {selectedChat.status === "waiting"
                  ? "Take over the chat to reply."
                  : "AI is responding automatically."}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
