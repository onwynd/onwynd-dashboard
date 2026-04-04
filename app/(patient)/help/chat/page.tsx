"use client";

import { useEffect, useRef } from "react";
import { X, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSupportChatStore } from "@/store/support-chat-store";
import { ChatBubble } from "@/components/support-chat/chat-bubble";
import { ChatInput } from "@/components/support-chat/chat-input";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  ai: { text: "Wynd AI", color: "text-violet-600", dot: "bg-violet-500" },
  waiting: { text: "Connecting to agent…", color: "text-amber-600", dot: "bg-amber-400 animate-pulse" },
  human: { text: "Live Support", color: "text-emerald-600", dot: "bg-emerald-500" },
  closed: { text: "Chat ended", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export default function HelpChatPage() {
  const {
    activeChatUuid,
    messages,
    status,
    isLoading,
    isSending,
    error,
    startChat,
    sendMessage,
    closeChat,
  } = useSupportChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Start a new session on mount if none exists
  useEffect(() => {
    if (!activeChatUuid) {
      startChat();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const statusInfo = status ? STATUS_LABELS[status] : null;
  const isClosed = status === "closed";

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-sm">W</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Onwynd Support</p>
            {statusInfo && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("w-2 h-2 rounded-full", statusInfo.dot)} />
                <span className={cn("text-xs font-medium", statusInfo.color)}>
                  {statusInfo.text}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection indicator */}
          {isLoading ? (
            <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : activeChatUuid ? (
            <Wifi className="w-4 h-4 text-emerald-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}

          {!isClosed && activeChatUuid && (
            <button
              onClick={closeChat}
              title="End chat"
              className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="text-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Starting your session…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-3 py-2 mb-2">
            {error}
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isSending && (
          <div className="flex gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700 flex-shrink-0 mt-1">
              W
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || !activeChatUuid}
          placeholder={
            status === "waiting"
              ? "A specialist is joining…"
              : "Ask Wynd anything…"
          }
        />
      ) : (
        <div className="p-4 border-t text-center">
          <p className="text-sm text-muted-foreground mb-3">
            This chat session has ended.
          </p>
          <button
            onClick={startChat}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Start a new chat
          </button>
        </div>
      )}
    </div>
  );
}
