"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import client from "@/lib/api/client";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, Send, Sparkles, User, Trash2, Plus,
  MessageSquare, ChevronLeft, Brain, TrendingUp,
  Cpu, Paperclip, FileText, Music, X,
  CalendarPlus, CalendarIcon, CheckCircle2, Image as ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ExecutiveBrandValuation } from "@/components/shared/executive-brand-valuation";
import { ExecutiveFinancePanel } from "@/components/shared/executive-finance-panel";

// ── Markdown renderer (handles bold, italic, headings, lists, code) ──────────
function renderMarkdown(text: string): string {
  const safe = escapeHtml(text);
  return safe
    // fenced code blocks
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.replace(/^```[^\n]*\n?/, "").replace(/```$/, "").trim();
      return `<pre class="bg-muted/60 rounded-md px-3 py-2 text-xs overflow-x-auto my-2 font-mono"><code>${escapeHtml(code)}</code></pre>`;
    })
    // inline code
    .replace(/`([^`]+)`/g, `<code class="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">$1</code>`)
    // h3
    .replace(/^### (.+)$/gm, `<h3 class="font-semibold text-sm mt-3 mb-1">$1</h3>`)
    // h2
    .replace(/^## (.+)$/gm, `<h2 class="font-bold text-base mt-3 mb-1">$1</h2>`)
    // h1
    .replace(/^# (.+)$/gm, `<h1 class="font-bold text-lg mt-3 mb-1">$1</h1>`)
    // bold
    .replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`)
    // italic
    .replace(/\*(.+?)\*/g, `<em>$1</em>`)
    // unordered lists
    .replace(/^[-•]\s+(.+)$/gm, `<li class="ml-4 list-disc">$1</li>`)
    // ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, `<li class="ml-4 list-decimal">$1</li>`)
    // wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (m) => `<ul class="space-y-0.5 my-1">${m}</ul>`)
    // line breaks
    .replace(/\n\n/g, `</p><p class="mt-2">`)
    .replace(/\n/g, `<br />`);
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Scheduling intent detection ───────────────────────────────────────────────
const SCHEDULE_KEYWORDS = ["schedule", "add event", "create appointment", "book", "remind me"];
const SCHEDULE_NOUNS = ["meeting", "call", "event", "demo", "sync", "session", "standup", "interview", "check-in", "1:1", "kickoff", "kick-off"];
const TIME_SLOTS_AI    = ["07:00","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];

function detectSchedulingIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return SCHEDULE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/** Best-effort extract of title, date, time from natural language */
function parseSchedulingHints(text: string): { title: string; date: Date | undefined; time: string } {
  const lower = text.toLowerCase();

  // Title: first event noun + surrounding context
  let title = "";
  for (const noun of SCHEDULE_NOUNS) {
    const idx = lower.indexOf(noun);
    if (idx !== -1) {
      // grab 2 words before + noun
      const before = text.slice(Math.max(0, idx - 20), idx).trim().split(/\s+/).slice(-2).join(" ");
      title = (before + " " + text.slice(idx, idx + noun.length)).trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      break;
    }
  }
  if (!title) title = "Meeting";

  // Date
  let date: Date | undefined;
  const now = new Date();
  if (/\btomorrow\b/.test(lower)) {
    date = new Date(now); date.setDate(date.getDate() + 1);
  } else if (/\btoday\b/.test(lower)) {
    date = new Date(now);
  } else {
    const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (dayMatch) {
      const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
      const target = days.indexOf(dayMatch[1]);
      const cur = now.getDay();
      const diff = (target - cur + 7) % 7 || 7;
      date = new Date(now); date.setDate(date.getDate() + diff);
    }
  }

  // Time
  let time = "10:00";
  const t12 = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (t12) {
    let h = parseInt(t12[1]);
    const m = parseInt(t12[2] ?? "0");
    if (t12[3].toLowerCase() === "pm" && h < 12) h += 12;
    if (t12[3].toLowerCase() === "am" && h === 12) h = 0;
    time = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  } else {
    const t24 = text.match(/\b(\d{1,2}):(\d{2})\b/);
    if (t24) time = `${String(parseInt(t24[1])).padStart(2,"0")}:${t24[2]}`;
  }

  return { title, date, time };
}

interface ScheduleSeed {
  title: string;
  date: Date | undefined;
  time: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  scheduleSeed?: ScheduleSeed;
  eventsList?: Array<{ title: string; time: string }>;
}

interface ConversationThread {
  conversation_id: string;
  last_at: string;
  preview: string;
}

const CAPABILITIES = [
  { icon: Brain, label: "Personalization Engine", desc: "Tailored responses based on your unique profile and history" },
  { icon: TrendingUp, label: "Natural Language Processing", desc: "Advanced NLP that understands context and intent" },
  { icon: Cpu, label: "Machine Learning Memory", desc: "Continuously learns from interactions to improve responses" },
];

export default function AdminAssistantPage() {
  const pathname = usePathname();
  const roleKey = pathname.startsWith("/ceo") ? "ceo" : pathname.startsWith("/coo") ? "coo" : "admin";
  const calendarRoleSegment = roleKey === "ceo" ? "CEO" : roleKey === "coo" ? "COO" : "admin";
  const calendarApiPath = calendarRoleSegment === "admin" ? "/api/admin/calendar/events" : `/api/${calendarRoleSegment}/calendar/events`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("document");
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schedule dialog state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleParticipants, setScheduleParticipants] = useState("");
  const [scheduleLink, setScheduleLink] = useState("");
  const [scheduleDatePickerOpen, setScheduleDatePickerOpen] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleCreatedId, setScheduleCreatedId] = useState<string | null>(null);

  const loadTodayEvents = useCallback(async () => {
    try {
      const response = await fetch(`${calendarApiPath}?date=today`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const events = (await response.json()) as Array<{ title?: string; time?: string }>;
      const normalized = Array.isArray(events)
        ? events.map((e) => ({ title: e.title ?? "Untitled", time: e.time ?? "10:00" }))
        : [];
      setMessages((prev) => [
        ...prev,
        {
          id: `today-events-${Date.now()}`,
          role: "assistant",
          content: normalized.length > 0 ? "Here are your events for today:" : "You have no events scheduled for today.",
          timestamp: new Date(),
          eventsList: normalized,
        },
      ]);
    } catch {
      // non-critical
    }
  }, [calendarApiPath]);

  const stripTags = (text: string) =>
    text
      .replace(/\[ADMIN_MEMO:[\s\S]*?\]/g, "")
      .replace(/\[ED:[\s\S]*?\]/g, "")
      .replace(/\[DEBUG:[\s\S]*?\]/g, "")
      .trim();

  const sanitize = (text: string) =>
    text.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 4000);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onResize = () => {
      setShowSidebar(window.innerWidth >= 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Load past conversation threads on mount
  const loadThreads = useCallback(async () => {
    try {
      const res = await client.get("/api/v1/admin/ai/conversations");
      const data = res.data.data ?? res.data;
      setThreads(Array.isArray(data) ? data : []);
    } catch {
      // threads unavailable — non-critical
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);
  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  // Load a specific conversation thread
  const loadConversation = async (id: string) => {
    setLoadingHistory(true);
    setConversationId(id);
    setMessages([]);
    try {
      const res = await client.get(`/api/v1/admin/ai/conversations/${id}`);
      const data: Array<{ role: string; content: string; created_at: string }> =
        res.data.data ?? res.data;
      const loaded: Message[] = data.map((m, i) => ({
        id: `loaded-${i}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
      setMessages(loaded);
    } catch {
      toast({ title: "Error", description: "Failed to load conversation.", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-detect file type based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      if (['pdf', 'doc', 'docx', 'txt', 'csv'].includes(extension)) {
        setFileType('document');
      } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
        setFileType('image');
      } else if (['mp3', 'wav'].includes(extension)) {
        setFileType('audio');
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    const text = sanitize(input.trim());
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text + (selectedFile ? `\n\n[File: ${selectedFile.name}]` : ""),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('message', text);
      if (conversationId) formData.append('conversation_id', conversationId);

      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('file_type', fileType);
      }

      const response = await client.post("/api/v1/admin/ai/chat", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const payload = response.data.data ?? response.data;
      const replyText: string =
        payload?.reply ??
        payload?.message ??
        "I'm unable to generate a response right now. Please try again.";

      const newConvId: string = payload?.conversation_id ?? conversationId;
      if (newConvId && newConvId !== conversationId) {
        setConversationId(newConvId);
        // Refresh thread list after first message of a new conversation
        loadThreads();
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: stripTags(replyText),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (/\b(what's on my calendar today|what do i have today|calendar today)\b/i.test(text)) {
        await loadTodayEvents();
      }

      // Scheduling intent — offer to create calendar event
      if (detectSchedulingIntent(text)) {
        const seed = parseSchedulingHints(text);
        const payload = {
          title: seed.title,
          date: seed.date ? format(seed.date, "yyyy-MM-dd") : new Date().toISOString().slice(0, 10),
          time: seed.time,
          description: text,
          attendees: [],
        };
        const createResponse = await fetch(calendarApiPath, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (createResponse.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: `scheduled-${Date.now()}`,
              role: "assistant",
              content: `I've scheduled ${payload.title} for ${payload.date} at ${payload.time}.`,
              timestamp: new Date(),
            },
          ]);
        }
        const seedMsg: Message = {
          id: `schedule-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          scheduleSeed: seed,
        };
        setMessages((prev) => [...prev, seedMsg]);
      }

      // Clear selected file after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatRelative = (iso: string) => {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleScheduleCreate = async () => {
    if (!scheduleTitle || !scheduleDate) {
      toast({ title: "Missing fields", description: "Please fill in a title and date.", variant: "destructive" });
      return;
    }
    setScheduleSaving(true);
    try {
      const [h, m] = scheduleTime.split(":").map(Number);
      const start = new Date(scheduleDate);
      start.setHours(h, m, 0, 0);

      const created = await fetch(calendarApiPath, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          title: scheduleTitle,
          date: format(scheduleDate, "yyyy-MM-dd"),
          time: format(start, "HH:mm"),
          description: scheduleLink || "",
          attendees: scheduleParticipants
            ? scheduleParticipants.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!created.ok) {
        throw new Error("Create event failed");
      }
      const createdData = (await created.json()) as { id?: string };
      setScheduleCreatedId(createdData?.id ?? "ok");
      toast({ title: "Event created", description: `"${scheduleTitle}" added to your calendar.` });
    } catch {
      toast({ title: "Error", description: "Could not create the event. Please try again.", variant: "destructive" });
    } finally {
      setScheduleSaving(false);
    }
  };

  const isNewChat = messages.length === 0 && !conversationId;
  const assistantTitle = roleKey === "ceo" ? "Onwynd CEO Intelligence" : roleKey === "coo" ? "Onwynd COO Intelligence" : "Onwynd Admin Intelligence";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Sidebar: conversation threads ── */}
      <aside
        className={`${
          showSidebar ? "w-64" : "w-0"
        } transition-all duration-200 overflow-hidden border-r bg-muted/30 flex flex-col shrink-0`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Conversations</span>
          <Button size="sm" variant="ghost" onClick={startNewConversation} className="h-7 px-2 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {threads.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No conversations yet</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.conversation_id}
                onClick={() => loadConversation(t.conversation_id)}
                className={`w-full text-left px-3 py-2.5 border-b hover:bg-muted/60 transition-colors ${
                  conversationId === t.conversation_id ? "bg-muted" : ""
                }`}
              >
                <p className="text-xs font-medium truncate leading-tight">{t.preview || "Conversation"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelative(t.last_at)}</p>
              </button>
            ))
          )}
        </ScrollArea>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setShowSidebar((v) => !v)}
          >
            {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold flex items-center gap-2 leading-tight">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              {assistantTitle}
            </h2>
            <p className="text-xs text-muted-foreground truncate">Strategic AI co-pilot · memory-enabled</p>
          </div>
          {conversationId && (
            <Badge variant="outline" className="text-[10px] hidden sm:flex shrink-0">
              Thread active
            </Badge>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={startNewConversation} className="h-8 px-2 gap-1 text-xs shrink-0">
              <Plus className="h-3.5 w-3.5" />
              New chat
            </Button>
          )}
        </div>

        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden rounded-none border-0 border-b">
          <ScrollArea className="flex-1 px-4 py-4">
            {/* Welcome / capabilities screen */}
            {isNewChat && (
              <div className="max-w-xl mx-auto pt-8 space-y-6">
                {(roleKey === "ceo" || roleKey === "coo") && (
                  <>
                    <ExecutiveBrandValuation mode="panel" />
                    <ExecutiveFinancePanel role={roleKey} />
                  </>
                )}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{assistantTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI co-pilot for platform strategy, analytics, operations, and growth.
                    Start typing to begin — I&apos;ll remember your preferences and insights over time.
                  </p>
                </div>
                <div className="grid gap-3">
                  {CAPABILITIES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Show NGN and USD subscription revenue plus platform booking fees for today",
                    "Break down therapist commission, payout risk, and margin impact",
                    "Give center CAPEX, OPEX, revenue and unit economics summary",
                    "List assets and inventory with current valuation date",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); }}
                      className="text-left text-xs p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-colors leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading history */}
            {loadingHistory && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 pb-2 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback
                      className={
                        msg.role === "assistant"
                          ? "bg-primary text-primary-foreground text-xs"
                          : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {msg.role === "assistant" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {msg.scheduleSeed ? (
                    /* ── Schedule suggestion card ── */
                    <div className="max-w-[80%] rounded-xl border bg-background shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/8 border-b">
                        <CalendarPlus className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold">Schedule an event</span>
                      </div>
                      <div className="px-4 py-3 space-y-1 text-sm">
                        <p><span className="text-muted-foreground text-xs">Title</span><br /><strong>{msg.scheduleSeed.title}</strong></p>
                        {msg.scheduleSeed.date && (
                          <p><span className="text-muted-foreground text-xs">Date</span><br />{format(msg.scheduleSeed.date, "EEE, MMM d yyyy")}</p>
                        )}
                        <p><span className="text-muted-foreground text-xs">Time</span><br />{msg.scheduleSeed.time}</p>
                      </div>
                      <div className="px-4 pb-3">
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => {
                            setScheduleTitle(msg.scheduleSeed!.title);
                            setScheduleDate(msg.scheduleSeed!.date);
                            setScheduleTime(msg.scheduleSeed!.time);
                            setScheduleParticipants("");
                            setScheduleLink("");
                            setScheduleCreatedId(null);
                            setScheduleOpen(true);
                          }}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Open in calendar
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-4 pb-2">{formatTime(msg.timestamp)}</p>
                    </div>
                  ) : msg.eventsList ? (
                  <div className="max-w-[80%] rounded-xl border bg-muted text-foreground px-4 py-2.5 text-sm">
                    <p className="font-medium mb-2">{msg.content}</p>
                    <ul className="space-y-1">
                      {msg.eventsList.map((event, index) => (
                        <li key={`${msg.id}-${index}`} className="text-xs">
                          {event.time} - {event.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  ) : (
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {msg.role === "assistant" && msg.content ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        className="text-sm leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_pre]:my-2"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1.5 ${
                        msg.role === "user"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <CardContent className="border-t pt-3 pb-3">
            {/* File upload preview */}
            {selectedFile && (
              <div className="max-w-3xl mx-auto mb-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 flex-1">
                    {fileType === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
                    {fileType === 'image' && <ImageIcon className="h-4 w-4 text-green-500" />}
                    {fileType === 'audio' && <Music className="h-4 w-4 text-purple-500" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fileType} • {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={removeSelectedFile}
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={startNewConversation}
                  title="Clear and start new chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* File upload button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                title="Attach file"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.mp3,.wav"
                onChange={handleFileSelect}
              />
              
              <Textarea
                placeholder={selectedFile ? "File attached. Ask anything about the platform…" : "Ask anything about the platform… (Enter to send, Shift+Enter for new line)"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-none flex-1"
                disabled={isLoading || loadingHistory}
                maxLength={4000}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || loadingHistory}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Schedule event dialog ── */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Create Calendar Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {scheduleCreatedId ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="font-semibold">Event created!</p>
                <p className="text-sm text-muted-foreground">&ldquo;{scheduleTitle}&rdquo; has been added to your calendar.</p>
                <Button variant="outline" onClick={() => setScheduleOpen(false)}>Close</Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="sch-title">Title</Label>
                  <Input
                    id="sch-title"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="Meeting title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Popover open={scheduleDatePickerOpen} onOpenChange={setScheduleDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate ? format(scheduleDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={(d) => { setScheduleDate(d); setScheduleDatePickerOpen(false); }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Select value={scheduleTime} onValueChange={(v) => setScheduleTime(v ?? scheduleTime)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS_AI.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sch-participants">Participants <span className="text-muted-foreground text-xs">(comma-separated emails)</span></Label>
                  <Input
                    id="sch-participants"
                    value={scheduleParticipants}
                    onChange={(e) => setScheduleParticipants(e.target.value)}
                    placeholder="alice@company.com, bob@company.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sch-link">Meeting link <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    id="sch-link"
                    value={scheduleLink}
                    onChange={(e) => setScheduleLink(e.target.value)}
                    placeholder="https://meet.google.com/…"
                  />
                </div>
              </>
            )}
          </div>

          {!scheduleCreatedId && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setScheduleOpen(false)} disabled={scheduleSaving}>Cancel</Button>
              <Button onClick={handleScheduleCreate} disabled={scheduleSaving || !scheduleTitle || !scheduleDate} className="gap-2">
                {scheduleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                Create event
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
