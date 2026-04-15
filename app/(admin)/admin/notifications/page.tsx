"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import client from "@/lib/api/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Bell, RefreshCw, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";

type BroadcastAudience = "all_patients" | "all_therapists" | "premium_users" | "inactive_30d";
type BroadcastChannel = "push" | "email" | "whatsapp";

type NotificationRow = {
  id?: string | number;
  created_at?: string;
  target_type?: string | null;
  audience?: string[] | string | null;
  title?: string | null;
  subject?: string | null;
  message?: string | null;
  html?: string | null;
  channel?: string | null;
};

const CHANNEL_STYLES: Record<string, string> = {
  push: "bg-blue-50 text-blue-700",
  email: "bg-indigo-50 text-indigo-700",
  whatsapp: "bg-green-50 text-green-700",
};

const TARGET_LABELS: Record<string, string> = {
  all_patients: "All Patients",
  all_therapists: "All Therapists",
  premium_users: "Premium Subscribers",
  inactive_30d: "Inactive (30+ days)",
};

export default function NotificationsPage() {
  const broadcastEnabled = true;
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    message: string;
    target_type: BroadcastAudience;
    channel: BroadcastChannel;
  }>({
    title: "",
    message: "",
    target_type: "all_patients",
    channel: "push",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/notifications");
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setNotifications(list as NotificationRow[]);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }

    setSubmitting(true);
    try {
      await client.post("/api/v1/admin/notifications/broadcast", {
        channel: formData.channel,
        target_type: formData.target_type,
        title: formData.title,
        message: formData.message,
        audience: [formData.target_type],
      });
      toast.success("Broadcast notification sent successfully");
      setFormData({ title: "", message: "", target_type: "all_patients", channel: "push" });
      fetchNotifications();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) {
        console.warn("Admin notification broadcast endpoint is not available yet.");
        toast.error("Broadcast is coming soon.");
      } else {
        toast.error("Failed to send broadcast notification");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getAudienceLabel = (notif: NotificationRow) => {
    const audience = Array.isArray(notif.audience)
      ? notif.audience[0]
      : typeof notif.audience === "string"
        ? notif.audience
        : notif.target_type ?? "";

    return TARGET_LABELS[audience] || audience || "System";
  };

  const getMessagePreview = (notif: NotificationRow) => {
    return notif.message || notif.html || "";
  };

  const getTitle = (notif: NotificationRow) => {
    return notif.title || notif.subject || "Untitled";
  };

  return (
    <main className="p-6 space-y-6">
      <PageHeader
        title="Push & Email Campaigns"
        subtitle="Broadcast notifications to users across the platform"
      >
        <Button onClick={fetchNotifications} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="w-4 h-4 text-teal" />
              Send New Broadcast
            </CardTitle>
            <CardDescription>Target all users or specific groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Group</Label>
              <Select
                value={formData.target_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, target_type: value as BroadcastAudience }))}
              >
                <SelectTrigger id="target">
                  <SelectValue placeholder="Select target group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_patients">All Patients</SelectItem>
                  <SelectItem value="all_therapists">All Therapists</SelectItem>
                  <SelectItem value="premium_users">Premium Subscribers</SelectItem>
                  <SelectItem value="inactive_30d">Inactive Users (30+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, channel: value as BroadcastChannel }))}
              >
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-title">Campaign Title</Label>
              <Input
                id="notif-title"
                placeholder="Short, catchy title..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message Body</Label>
              <Textarea
                id="message"
                placeholder="What do you want to say?"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <Button
              className="w-full gap-2 bg-teal text-white hover:bg-teal-mid"
              onClick={handleSendBroadcast}
              disabled={submitting || !broadcastEnabled}
              title={broadcastEnabled ? "Send broadcast notification" : "Coming soon"}
            >
              <Send className="w-4 h-4" />
              {submitting ? "Sending..." : "Launch Campaign"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4 text-gray-500" />
              Notification History
            </CardTitle>
            <CardDescription>Log of recent broadcasts and system alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Target</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Message</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Channel</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableBodyShimmer rows={5} cols={5} />
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-14">
                          <Bell className="w-10 h-10 text-gray-200 mb-3" />
                          <p className="text-sm font-medium text-gray-500">No notifications sent yet</p>
                          <p className="text-xs text-gray-400 mt-1">Your sent campaigns will appear here</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notif, idx) => (
                      <TableRow
                        key={String(notif.id ?? `${notif.created_at ?? "row"}-${idx}`)}
                        className={idx % 2 === 0 ? "bg-white hover:bg-teal/5" : "bg-gray-50/50 hover:bg-teal/5"}
                      >
                        <TableCell className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {notif.created_at ? format(new Date(notif.created_at), "MMM d, HH:mm") : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-xs font-medium capitalize text-gray-700">{getAudienceLabel(notif)}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 max-w-xs">
                          <p className="text-sm font-semibold text-gray-900 truncate">{getTitle(notif)}</p>
                          <p className="text-xs text-gray-400 truncate">{getMessagePreview(notif)}</p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CHANNEL_STYLES[(notif.channel as string) || formData.channel] ?? "bg-gray-50 text-gray-600"}`}>
                            {(notif.channel as string) || formData.channel}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            Sent
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


