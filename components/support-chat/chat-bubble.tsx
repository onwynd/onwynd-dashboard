"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage, SenderType } from "@/lib/api/support-chat";

interface ChatBubbleProps {
  message: ChatMessage;
}

const SENDER_LABELS: Record<SenderType, string> = {
  user: "You",
  ai: "Wynd",
  agent: "Support",
  system: "",
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const { sender_type, message: text, created_at } = message;

  if (sender_type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {text}
        </span>
      </div>
    );
  }

  const isUser = sender_type === "user";
  const time = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-2 mb-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar dot */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1",
          isUser
            ? "bg-indigo-100 text-indigo-700"
            : sender_type === "agent"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-violet-100 text-violet-700"
        )}
      >
        {SENDER_LABELS[sender_type][0] ?? "•"}
      </div>

      <div className={cn("max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[11px] text-muted-foreground font-medium">
            {SENDER_LABELS[sender_type]}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
