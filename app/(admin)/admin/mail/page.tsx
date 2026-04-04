"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Inbox,
  Send,
  File,
  Trash2,
  AlertCircle,
  Search,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Reply,
  Archive,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import client from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MailStatus } from "@/components/shared/mail-status";

export default function MailPage() {
  const [folder, setFolder] = useState("INBOX");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [folders, setFolders] = useState<any[]>([]);

  const fetchFolders = async () => {
    try {
      const res = await client.get("/api/v1/admin/mail/folders");
      setFolders(res.data);
    } catch (err) {}
  };

  const fetchMessages = async (f = folder, p = page) => {
    setLoading(true);
    try {
      const res = await client.get(`/api/v1/admin/mail/inbox?folder=${f}&page=${p}`);
      setMessages(res.data.messages || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast({ 
        title: "Mail Error", 
        description: err.response?.data?.error || "Failed to fetch messages", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageDetail = async (id: string) => {
    try {
      const res = await client.get(`/api/v1/admin/mail/${id}`);
      setSelectedMessage(res.data);
      // Mark as read in list
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      toast({ title: "Error", description: "Failed to load message body", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchMessages();
  }, []);

  const handleFolderChange = (f: string) => {
    setFolder(f);
    setPage(1);
    setSelectedMessage(null);
    fetchMessages(f, 1);
  };

  const handleRefresh = () => {
    fetchFolders();
    fetchMessages();
  };

  const handleTrash = async (id: string) => {
    if (!confirm("Move this message to trash?")) return;
    try {
      await client.delete(`/api/v1/admin/mail/${id}`);
      toast({ description: "Message moved to trash" });
      setSelectedMessage(null);
      fetchMessages();
    } catch {
      toast({ title: "Error", description: "Failed to move message to trash", variant: "destructive" });
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      await client.patch(`/api/v1/admin/mail/${id}/read`, { read: false });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: false } : m));
      toast({ description: "Marked as unread" });
    } catch {
      toast({ title: "Error", description: "Failed to mark as unread", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-64 flex flex-col gap-2 shrink-0">
        <Button 
          className="w-full justify-start gap-2 mb-2" 
          onClick={() => toast({ description: "Compose via Mail Settings — connect your mail provider first." })}
        >
          <Plus className="w-4 h-4" />
          Compose
        </Button>
        
        <div className="space-y-1">
          {folders.length === 0 ? (
            ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam'].map(f => (
              <Button 
                key={f} 
                variant={folder === f.toUpperCase() ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
                onClick={() => handleFolderChange(f.toUpperCase())}
              >
                {f === 'Inbox' && <Inbox className="w-4 h-4" />}
                {f === 'Sent' && <Send className="w-4 h-4" />}
                {f === 'Drafts' && <File className="w-4 h-4" />}
                {f === 'Trash' && <Trash2 className="w-4 h-4" />}
                {f === 'Spam' && <AlertCircle className="w-4 h-4" />}
                {f}
              </Button>
            ))
          ) : (
            folders.map(f => (
              <Button 
                key={f.name} 
                variant={folder === f.name ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3 relative"
                onClick={() => handleFolderChange(f.name)}
              >
                {f.name === 'INBOX' ? <Inbox className="w-4 h-4" /> : <File className="w-4 h-4" />}
                <span className="truncate">{f.display_name}</span>
                {f.unread > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                    {f.unread}
                  </Badge>
                )}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Message List */}
      <Card className="w-96 flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                {folder}
                {loading && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
              </h2>
              <MailStatus />
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No messages found.
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${selectedMessage?.id === msg.id ? 'bg-accent' : ''} ${!msg.is_read ? 'border-l-4 border-l-primary' : ''}`}
                  onClick={() => fetchMessageDetail(msg.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm truncate max-w-[180px] ${!msg.is_read ? 'font-bold' : 'text-muted-foreground'}`}>
                      {msg.from}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(msg.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className={`text-sm truncate mb-1 ${!msg.is_read ? 'font-semibold' : ''}`}>
                    {msg.subject || "(No Subject)"}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {msg.snippet}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{total} messages</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchMessages(folder, page - 1); }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={messages.length < 20} onClick={() => { setPage(p => p + 1); fetchMessages(folder, page + 1); }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Message Content */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)} className="lg:hidden">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="Archive" onClick={() => handleTrash(selectedMessage.id)}><Archive className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" title="Delete" className="text-destructive" onClick={() => handleTrash(selectedMessage.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Reply className="w-4 h-4" />
                  Reply
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMarkUnread(selectedMessage.id)}>Mark as unread</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleTrash(selectedMessage.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-xl font-bold mb-2">{selectedMessage.subject}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{selectedMessage.from}</span>
                      <span className="text-muted-foreground">&lt;{selectedMessage.from_email || selectedMessage.from}&gt;</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      To: {selectedMessage.to}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedMessage.date).toLocaleString()}
                  </div>
                </div>

                {selectedMessage.attachments?.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {selectedMessage.attachments.map((att: any) => (
                      <Badge key={att.id} variant="outline" className="gap-2 py-1.5 px-3 cursor-pointer hover:bg-accent">
                        <Paperclip className="w-3 h-3" />
                        {att.name}
                        <span className="text-[10px] opacity-50">({Math.round(att.size / 1024)} KB)</span>
                      </Badge>
                    ))}
                  </div>
                )}

                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.body_html || selectedMessage.body_text?.replace(/\n/g, '<br>') }}
                />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <Mail className="w-16 h-16 mb-4 opacity-10" />
            <h3 className="text-lg font-medium">Select an email to read</h3>
            <p className="max-w-xs text-sm mt-2">
              Select a message from the list to view its contents, attachments, and options.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
