"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, AlertCircle, MessageSquare, CalendarCheck, Stethoscope, ShieldAlert, Banknote, UserCheck, Users, Inbox, Star, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import client from "@/lib/api/client";

export interface Notification {
  id: number | string;
  title?: string;
  message?: string;
  body?: string;        // legacy field name used by some older notifications
  type?: string;
  data?: Record<string, string | number | boolean | null>;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Resolve display title — checks direct column first, then data JSON */
function resolveTitle(n: Notification): string {
  return normalizeText(n.title) ?? normalizeText(n.data?.title) ?? "Notification";
}

/** Resolve display message — checks direct column first, then body, then data JSON */
function resolveMessage(n: Notification): string | null {
  return (
    normalizeText(n.message) ??
    normalizeText(n.body) ??
    normalizeText(n.data?.message) ??
    normalizeText(n.data?.body) ??
    null
  );
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifIcon(type?: string) {
  switch (type) {
    case "session":
    case "appointment":
    case "booking":
      return <Stethoscope className="size-4 text-blue-500 shrink-0" />;
    case "message":
    case "chat":
      return <MessageSquare className="size-4 text-indigo-500 shrink-0" />;
    case "alert":
    case "warning":
    case "security":
      return <ShieldAlert className="size-4 text-orange-500 shrink-0" />;
    case "reminder":
      return <Clock className="size-4 text-yellow-500 shrink-0" />;
    case "payment":
    case "payout":
    case "invoice":
      return <Banknote className="size-4 text-emerald-500 shrink-0" />;
    case "approval":
    case "verification":
      return <UserCheck className="size-4 text-violet-500 shrink-0" />;
    case "schedule":
    case "calendar":
      return <CalendarCheck className="size-4 text-sky-500 shrink-0" />;
    case "error":
    case "critical":
      return <AlertCircle className="size-4 text-red-500 shrink-0" />;
    case "waitlist":
      return <Users className="size-4 text-teal-500 shrink-0" />;
    case "contact":
      return <Inbox className="size-4 text-blue-500 shrink-0" />;
    case "feedback":
      return <Star className="size-4 text-amber-500 shrink-0" />;
    case "signup":
      return <UserPlus className="size-4 text-green-500 shrink-0" />;
    default:
      return <CheckCheck className="size-4 text-green-500 shrink-0" />;
  }
}

interface NotificationBellProps {
  /** API base path for this role, e.g. "/api/v1/admin" or "/api/v1/hr" */
  basePath: string;
  /** Role-specific notifications page path, e.g. "/admin/notifications" */
  notificationsPath?: string;
}

export function NotificationBell({ basePath, notificationsPath }: NotificationBellProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        client.get(`${basePath}/notifications`, { params: { per_page: 10 } }),
        client.get(`${basePath}/notifications/unread-count`),
      ]);
      const list = listRes.data.data ?? listRes.data;
      const items: Notification[] = Array.isArray(list?.data) ? list.data : Array.isArray(list) ? list : [];
      setNotifications(items);
      const countData = countRes.data.data ?? countRes.data;
      setUnreadCount(countData?.count ?? countData?.unread_count ?? 0);
    } catch {
      // silently fail — no network or not yet deployed
    }
  }, [basePath]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await client.patch(`${basePath}/notifications/read-all`);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const markOneRead = async (id: number | string) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.is_read) return; // already read — skip API call
    try {
      await client.patch(`${basePath}/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch { /* ignore */ }
  };

  if (!mounted) return <div className="size-9 shrink-0" />;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) fetchNotifications();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 shrink-0">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex flex-col items-start gap-1 p-3 cursor-pointer",
                !n.is_read && "bg-muted/50"
              )}
              onClick={() => {
                markOneRead(n.id);
                if (n.action_url) router.push(n.action_url);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                {notifIcon(n.type)}
                <span className="text-sm font-medium flex-1 line-clamp-1">
                  {resolveTitle(n)}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {timeAgo(n.created_at)}
                </span>
                {!n.is_read && (
                  <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
              {resolveMessage(n) && (
                <p className="text-xs text-muted-foreground pl-6 line-clamp-2">
                  {resolveMessage(n)}
                </p>
              )}
            </DropdownMenuItem>
          ))
        )}

        {notificationsPath && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-xs text-muted-foreground hover:text-foreground py-2"
              onClick={() => router.push(notificationsPath)}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
