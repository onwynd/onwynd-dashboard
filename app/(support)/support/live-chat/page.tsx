"use client";

import { useEffect } from "react";
import { LiveChatPanel } from "@/components/support-chat/live-chat-panel";
import { useSupportChatStore } from "@/store/support-chat-store";

export default function LiveChatPage() {
  const { loadActiveChats, subscribeToAgentChannel } = useSupportChatStore();

  useEffect(() => {
    loadActiveChats();
    subscribeToAgentChannel();

    // Poll every 30 s as a safety net
    const interval = setInterval(loadActiveChats, 30_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Live Chat</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time conversations — AI handles them until you take over.
          </p>
        </div>
      </div>
      <LiveChatPanel />
    </div>
  );
}
