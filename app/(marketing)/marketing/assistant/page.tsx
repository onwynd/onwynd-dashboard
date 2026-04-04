"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { useState, useRef, useEffect } from "react";
import client from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Loader2, TrendingUp, Mail, Target, BarChart2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const capabilities = [
  { icon: TrendingUp, label: "Analyze campaign performance" },
  { icon: Mail, label: "Write a broadcast email" },
  { icon: Target, label: "Suggest audience segments" },
  { icon: BarChart2, label: "Review lead conversion" },
];

export default function MarketingAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await client.post("/api/v1/marketing/ai/chat", {
        message: userText,
        context: "You are a marketing AI assistant helping with campaigns, email strategies, and lead generation.",
      });
      const reply = res.data?.data?.reply ?? res.data?.reply ?? "I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 flex flex-col p-4 sm:p-6 gap-4 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">Marketing AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Campaigns, content, and strategy support</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="flex size-16 mx-auto mb-3 items-center justify-center rounded-2xl bg-gradient-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
                  <Sparkles className="size-8" />
                </div>
                <h2 className="text-lg font-semibold">Marketing Assistant</h2>
                <p className="text-sm text-muted-foreground mt-1">Ask me to help with campaigns, copy, or strategy.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {capabilities.map(({ icon: Icon, label }) => (
                  <Card key={label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => send(label)}>
                    <CardContent className="flex items-center gap-2 p-3">
                      <Icon className="size-4 text-primary shrink-0" />
                      <span className="text-xs font-medium">{label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="space-y-4 pr-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-b from-[#6e3ff3] to-[#aa8ef9] text-white text-xs">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-b from-[#6e3ff3] to-[#aa8ef9] text-white text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-card border rounded-xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2 shrink-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about campaigns, copy writing, or strategy..."
              className="resize-none min-h-[44px] max-h-[120px]"
              rows={1}
            />
            <Button onClick={() => send()} disabled={!input.trim() || loading} size="icon" className="shrink-0 self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
