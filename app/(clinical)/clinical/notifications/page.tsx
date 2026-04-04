"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

export default function ClinicalNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/notifications");
      const data = res.data?.data ?? res.data;
      setNotifications(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load notifications.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await client.patch("/api/v1/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      toast({ title: "All marked as read" });
    } catch {
      toast({ title: "Error", description: "Could not mark as read.", variant: "destructive" });
    }
  };

  const unread = notifications.filter(n => !n.read_at).length;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unread > 0 && (
              <Badge className="bg-red-500 text-white text-xs">{unread}</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Clinical alerts, system messages, and updates.
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{notifications.length} notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.map(n => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors",
                  !n.read_at ? "bg-blue-50/40" : "hover:bg-muted/20"
                )}
              >
                <Bell className={cn("h-4 w-4 mt-0.5 shrink-0", !n.read_at ? "text-blue-500" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.read_at ? "font-semibold" : "font-medium")}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(n.created_at), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                {!n.read_at && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


