"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, PanelLeft, Check, RefreshCw, Bell, CheckCheck, Clock, AlertCircle, Stethoscope, Wifi, WifiOff } from "lucide-react";
import client from "@/lib/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTherapistStore, type LayoutDensity } from "@/store/therapist-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { therapistService } from "@/lib/api/therapist";
import { cn } from "@/lib/utils";

const densityLabels: Record<LayoutDensity, string> = {
  default: "Default",
  compact: "Compact",
  comfortable: "Comfortable",
};

interface Notification {
  id: number | string;
  title?: string;
  message?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
  if (type === "session" || type === "appointment") return <Stethoscope className="size-4 text-blue-500" />;
  if (type === "alert" || type === "warning") return <AlertCircle className="size-4 text-orange-500" />;
  if (type === "reminder") return <Clock className="size-4 text-yellow-500" />;
  return <CheckCheck className="size-4 text-green-500" />;
}

export function TherapistHeader() {
  // ── Online / offline manual toggle ────────────────────────────────────────
  // Initialises from the user record in localStorage (is_online field).
  // Only approved therapists can go online — the API enforces this too.
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Boolean(u?.is_online);
    } catch { return false; }
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const toggleOnlineStatus = async () => {
    const next = !isOnline;
    setStatusLoading(true);
    try {
      await client.post(`/api/v1/therapist/status/${next ? "online" : "offline"}`);
      setIsOnline(next);
      // Persist to localStorage so the state survives soft refreshes
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          u.is_online = next;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch { /* non-fatal */ }
    } catch {
      // API rejected (e.g. not approved) — don't flip UI
    } finally {
      setStatusLoading(false);
    }
  };

  const showAlertBanner = useTherapistStore((state) => state.showAlertBanner);
  const showStatsCards = useTherapistStore((state) => state.showStatsCards);
  const showChart = useTherapistStore((state) => state.showChart);
  const showTable = useTherapistStore((state) => state.showTable);
  const layoutDensity = useTherapistStore((state) => state.layoutDensity);
  const setShowAlertBanner = useTherapistStore((state) => state.setShowAlertBanner);
  const setShowStatsCards = useTherapistStore((state) => state.setShowStatsCards);
  const setShowChart = useTherapistStore((state) => state.setShowChart);
  const setShowTable = useTherapistStore((state) => state.setShowTable);
  const setLayoutDensity = useTherapistStore((state) => state.setLayoutDensity);
  const resetLayout = useTherapistStore((state) => state.resetLayout);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [list, countData] = await Promise.all([
        therapistService.getNotifications({ per_page: 10 }),
        therapistService.getUnreadNotificationCount(),
      ]);
      const items: Notification[] = Array.isArray(list) ? list : [];
      setNotifications(items);
      const count = (countData as { count?: number; unread_count?: number })?.count
        ?? (countData as { count?: number; unread_count?: number })?.unread_count
        ?? 0;
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await therapistService.markNotificationRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const handleMarkOne = async (id: number | string) => {
    try {
      await therapistService.markNotificationRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* ignore */ }
  };

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Dashboard</h1>

      <ThemeToggle />

      <DropdownMenu open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) fetchNotifications(); }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative size-9">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-3 py-2">
            <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.slice(0, 8).map((n) => {
              const title = normalizeText(n.title) ?? "Notification";
              const message = normalizeText(n.message);

              return (
                <DropdownMenuItem
                  key={n.id}
                  className={cn("flex flex-col items-start gap-1 p-3 cursor-pointer", !n.is_read && "bg-muted/50")}
                  onClick={() => { if (!n.is_read) handleMarkOne(n.id); }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {notifIcon(n.type)}
                    <span className="text-sm font-medium flex-1 line-clamp-1">{title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                    {!n.is_read && <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  {message && (
                    <p className="text-xs text-muted-foreground pl-6 line-clamp-2">{message}</p>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Online / Offline status toggle — visible to approved therapists only */}
      <Button
        variant="outline"
        size="sm"
        disabled={statusLoading}
        onClick={toggleOnlineStatus}
        className={`hidden sm:flex items-center gap-2 font-semibold transition-colors ${
          isOnline
            ? "border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
            : "border-slate-300 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
      >
        {isOnline ? (
          <><Wifi className="size-3.5" /><span>Online</span><span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /></>
        ) : (
          <><WifiOff className="size-3.5" /><span>Offline</span></>
        )}
      </Button>

      <UserAvatarMenu />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <PanelLeft className="size-4" />
            Edit Layout
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Layout Density
          </DropdownMenuLabel>
          {(Object.keys(densityLabels) as LayoutDensity[]).map((key) => (
            <DropdownMenuItem key={key} onClick={() => setLayoutDensity(key)}>
              {densityLabels[key]}
              {layoutDensity === key && <Check className="size-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Show / Hide Sections
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showAlertBanner} onCheckedChange={setShowAlertBanner}>
            Alert Banner
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showStatsCards} onCheckedChange={setShowStatsCards}>
            Statistics Cards
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showChart} onCheckedChange={setShowChart}>
            Financial Flow Chart
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showTable} onCheckedChange={setShowTable}>
            Patients Table
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetLayout}>
            <RefreshCw className="size-4 mr-2" />
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
