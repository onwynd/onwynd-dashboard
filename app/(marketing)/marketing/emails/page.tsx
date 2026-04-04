"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { useState } from "react";
import { marketingService, AudienceType } from "@/lib/api/marketing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Users, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

const AUDIENCES: { id: AudienceType; label: string }[] = [
  { id: "staff", label: "Staff" },
  { id: "therapists", label: "Therapists" },
  { id: "customers", label: "Customers" },
  { id: "investors", label: "Investors" },
];

export default function MarketingEmailsPage() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceType[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const toggleAudience = (id: AudienceType) => {
    setSelectedAudiences((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
    setPreviewCount(null);
  };

  const handlePreview = async () => {
    if (selectedAudiences.length === 0) return;
    setPreviewing(true);
    try {
      const res = await marketingService.previewBroadcast({ audience: selectedAudiences });
      setPreviewCount(res.data?.count ?? 0);
    } catch {
      toast({ description: "Failed to preview audience", variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !html.trim() || selectedAudiences.length === 0) return;
    setSending(true);
    try {
      const res = await marketingService.sendBroadcast({ subject, html, audience: selectedAudiences });
      toast({ description: `Broadcast sent to ${res.data?.sent ?? 0} recipients` });
      setSubject("");
      setHtml("");
      setSelectedAudiences([]);
      setPreviewCount(null);
    } catch {
      toast({ description: "Failed to send broadcast", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email Broadcasts</h1>
            <p className="text-muted-foreground text-sm mt-1">Send targeted email campaigns to your audience segments.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 space-y-0">
              <CardHeader>
                <CardTitle>Compose Broadcast</CardTitle>
                <CardDescription>Write and send a broadcast email to selected segments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Subject Line</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your email subject..." />
                </div>
                <div className="grid gap-2">
                  <Label>Message Body</Label>
                  <RichTextEditor value={html} onChange={setHtml} placeholder="Write your broadcast message..." />
                </div>
                <div className="flex justify-between items-center pt-2">
                  {previewCount !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{previewCount} recipients selected</span>
                    </div>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={handlePreview} disabled={previewing || selectedAudiences.length === 0}>
                      {previewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Preview Audience
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={sending || !subject.trim() || !html.trim() || selectedAudiences.length === 0}
                      className="gap-2"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Broadcast
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> Audience Segments</CardTitle>
                <CardDescription>Select who receives this broadcast.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {AUDIENCES.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-3">
                    <Checkbox
                      id={id}
                      checked={selectedAudiences.includes(id)}
                      onCheckedChange={() => toggleAudience(id)}
                    />
                    <Label htmlFor={id} className="cursor-pointer font-normal">{label}</Label>
                    {selectedAudiences.includes(id) && <Badge variant="secondary" className="ml-auto text-xs">Selected</Badge>}
                  </div>
                ))}
                {selectedAudiences.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Select at least one audience segment.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
