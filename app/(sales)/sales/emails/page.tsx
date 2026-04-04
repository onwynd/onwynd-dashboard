"use client";

import { useEffect, useState } from "react";
import { useSalesStore } from "@/store/sales-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Mail, Plus, Search, Send, User, Loader2 } from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";

export default function SalesEmailsPage() {
  const rawLeads = useSalesStore((state) => state.leads);
  const fetchLeads = useSalesStore((state) => state.fetchLeads);
  const [search, setSearch] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filtered = rawLeads.filter((l) => {
    const name = `${l.first_name} ${l.last_name}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || l.email.toLowerCase().includes(q) || (l.company ?? "").toLowerCase().includes(q);
  });

  const handleSend = async () => {
    if (!toEmail.trim() || !subject.trim()) return;
    setSending(true);
    try {
      await client.post("/api/v1/sales/mail/send", { to: toEmail, subject, body });
      toast({ description: `Email sent to ${toEmail}` });
      setIsComposing(false);
      setToEmail("");
      setSubject("");
      setBody("");
    } catch {
      toast({ description: "Failed to send email", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Outreach</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage email communications with your leads.</p>
        </div>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Compose Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="lead@company.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Following up on..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Message</Label>
                <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
              <Button onClick={handleSend} disabled={sending || !toEmail.trim() || !subject.trim()} className="gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rawLeads.length}</div>
            <p className="text-xs text-muted-foreground">contacts in pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {rawLeads.filter((l) => l.status === "contacted").length}
            </div>
            <p className="text-xs text-muted-foreground">leads reached out to</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rawLeads.filter((l) => l.status === "qualified").length}
            </div>
            <p className="text-xs text-muted-foreground">ready for proposal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Contacts</CardTitle>
          <CardDescription>Click a lead to compose an email to them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="divide-y">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground text-sm">No leads found.</p>
            ) : (
              filtered.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{lead.first_name} {lead.last_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{lead.status}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => { setToEmail(lead.email); setIsComposing(true); }}
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
