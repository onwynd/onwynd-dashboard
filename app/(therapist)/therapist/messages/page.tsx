"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Send, Search, MessageSquare, MoreHorizontal, AlertTriangle, Plus,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StaffUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string;
  is_online?: boolean;
  role?: { name: string; slug: string };
}

interface ChatMessage {
  id: number;
  from_user_id: number;
  to_user_id: number;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: number; first_name: string; last_name: string };
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function initials(u: StaffUser) {
  return `${u.first_name[0] ?? ""}${u.last_name[0] ?? ""}`.toUpperCase();
}

function timeLabel(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function MessagesPage() {
  // ── Staff / conversations list ───────────────────────────────────────────
  const [staff,          setStaff]          = useState<StaffUser[]>([]);
  const [staffSearch,    setStaffSearch]     = useState("");
  const [staffLoading,   setStaffLoading]    = useState(true);
  const [conversations,  setConversations]   = useState<StaffUser[]>([]);

  // ── Active conversation ──────────────────────────────────────────────────
  const [activeUser,     setActiveUser]      = useState<StaffUser | null>(null);
  const [messages,       setMessages]        = useState<ChatMessage[]>([]);
  const [msgLoading,     setMsgLoading]      = useState(false);
  const [msgError,       setMsgError]        = useState<string | null>(null);
  const [draft,          setDraft]           = useState("");
  const [sending,        setSending]         = useState(false);
  const [myId,           setMyId]            = useState<number | null>(null);

  // ── Tab (conversations | new) ────────────────────────────────────────────
  const [tab, setTab] = useState<"conversations" | "new">("conversations");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── Load current user id ─────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u?.id) setMyId(Number(u.id));
    } catch { /* ignore */ }
  }, []);

  /* ── Load recent conversations ───────────────────────────────────────────*/
  useEffect(() => {
    (async () => {
      try {
        const res = await client.get("/api/v1/chat/conversations");
        const items: StaffUser[] = (res.data?.data?.conversations ?? []) as StaffUser[];
        setConversations(items);
      } catch { /* ignore */ }
    })();
  }, []);

  /* ── Load staff directory (for new conversations) ────────────────────── */
  useEffect(() => {
    setStaffLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await client.get("/api/v1/chat/staff", {
          params: staffSearch ? { search: staffSearch } : {},
        });
        setStaff((res.data?.data ?? []) as StaffUser[]);
      } catch { /* ignore */ }
      finally { setStaffLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [staffSearch]);

  /* ── Load messages for active conversation ────────────────────────────── */
  const loadMessages = useCallback(async (userId: number) => {
    setMsgLoading(true);
    setMsgError(null);
    try {
      const res = await client.get(`/api/v1/chat/conversations/${userId}`);
      const msgs: ChatMessage[] = (res.data?.data?.messages ?? []).reverse();
      setMessages(msgs);
    } catch {
      setMsgError("Could not load messages. Please try again.");
    } finally {
      setMsgLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeUser) loadMessages(activeUser.id);
  }, [activeUser, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ─────────────────────────────────────────────────────── */
  const sendMessage = async () => {
    if (!draft.trim() || !activeUser || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    // Optimistic append
    const optimistic: ChatMessage = {
      id: Date.now(),
      from_user_id: myId ?? 0,
      to_user_id: activeUser.id,
      message: text,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await client.post("/api/v1/chat/messages", {
        to_user_id: activeUser.id,
        message: text,
        message_type: "text",
      });
    } catch {
      // Roll back optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const displayList = tab === "conversations" ? conversations : staff;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left pane: contact list ──────────────────────────────────────── */}
      <div className="w-72 border-r flex flex-col bg-background shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Messages</h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setTab(tab === "new" ? "conversations" : "new")}
              title="New conversation"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mb-2">
            {(["conversations", "new"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 text-xs py-1 rounded-md font-medium transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {t === "conversations" ? "Recent" : "New Chat"}
              </button>
            ))}
          </div>
          {tab === "new" && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff…"
                className="pl-8 h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {staffLoading && tab === "new" ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-4">
              {tab === "conversations"
                ? "No conversations yet. Start one below."
                : "No staff members found."}
            </p>
          ) : (
            displayList.map((user) => (
              <button
                key={user.id}
                onClick={() => { setActiveUser(user); setTab("conversations"); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                  activeUser?.id === user.id && "bg-muted"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="" className="size-9 rounded-full object-cover" />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {initials(user)}
                    </div>
                  )}
                  {user.is_online && (
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.role && (
                    <p className="text-xs text-muted-foreground capitalize">{user.role.name}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right pane: active conversation ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeUser ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
              <div className="relative">
                {activeUser.profile_photo ? (
                  <img src={activeUser.profile_photo} alt="" className="size-9 rounded-full object-cover" />
                ) : (
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {initials(activeUser)}
                  </div>
                )}
                {activeUser.is_online && (
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {activeUser.first_name} {activeUser.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeUser.is_online ? (
                    <span className="text-emerald-600">Online</span>
                  ) : "Offline"}
                  {activeUser.role && ` · ${activeUser.role.name}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgError && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>{msgError}</AlertDescription>
                </Alert>
              )}
              {msgLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                      <Skeleton className="h-10 w-48 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <MessageSquare className="size-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.from_user_id === myId;
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-3.5 py-2 rounded-2xl text-sm break-words",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        <p>{msg.message}</p>
                        <p className={cn("text-[10px] mt-0.5 text-right", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {timeLabel(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t bg-background">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeUser.first_name}…`}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={!draft.trim() || sending}>
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageSquare className="size-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">Staff Messaging</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Select a conversation on the left or start a new one. Messages are private between staff members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
