"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, Search, Wifi, WifiOff, ShieldOff, LogOut, Smartphone, Monitor, Tablet } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AuthSession {
  id: number;
  token_name: string;
  created_at: string;
  last_used_at: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  last_seen_at: string | null;
  is_online: boolean;
  // New fields (optional — backend may not yet return them)
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location?: string;
  auth_provider?: string;
}

function SessionDeviceIcon({ deviceType }: { deviceType?: string }) {
  if (deviceType === "mobile") return <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />;
  if (deviceType === "tablet") return <Tablet className="h-4 w-4 shrink-0 text-muted-foreground" />;
  return <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

export default function AuthSessionsPage() {
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [revoking, setRevoking] = useState<number | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<{ type: "token" | "user"; id: number; label: string } | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuthSessions() as any;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setSessions(list);
    } catch {
      toast({ title: "Error", description: "Failed to load active sessions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const iv = setInterval(fetchSessions, 30_000);
    return () => clearInterval(iv);
  }, [fetchSessions]);

  const handleRevokeToken = async (id: number) => {
    setRevoking(id);
    try {
      await adminService.revokeAuthSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Session revoked", description: "The token has been invalidated." });
    } catch {
      toast({ title: "Error", description: "Failed to revoke session.", variant: "destructive" });
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  const handleRevokeUser = async (userId: number) => {
    setRevoking(userId);
    try {
      await adminService.revokeUserSessions(userId);
      setSessions((prev) => prev.filter((s) => s.user_id !== userId));
      toast({ title: "All sessions revoked", description: "All tokens for this user have been invalidated." });
    } catch {
      toast({ title: "Error", description: "Failed to revoke user sessions.", variant: "destructive" });
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.user_name?.toLowerCase().includes(q) ||
      s.user_email?.toLowerCase().includes(q) ||
      s.token_name?.toLowerCase().includes(q)
    );
  });

  const onlineCount = sessions.filter((s) => s.is_online).length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Sessions</h2>
          <p className="text-muted-foreground">
            All active Sanctum tokens issued in the last 24 hours.
            {!loading && (
              <span className="ml-2 text-xs">
                {onlineCount} online · {sessions.length} total sessions
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user or token…"
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length },
          { label: "Online Now", value: onlineCount },
          { label: "Offline", value: sessions.length - onlineCount },
          { label: "Unique Users", value: new Set(sessions.map((s) => s.user_id)).size },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-xs uppercase">User</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Status</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Token</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Device</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Location</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Created</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase">Last Active</TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j} className="px-4 py-3">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                      <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      {search ? "No sessions match your search." : "No active sessions found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="px-4 py-3">
                        <p className="text-sm font-medium">{s.user_name}</p>
                        <p className="text-xs text-muted-foreground">{s.user_email}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {s.is_online ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                            <Wifi className="h-3 w-3" /> Online
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 gap-1">
                            <WifiOff className="h-3 w-3" /> Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {s.token_name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <SessionDeviceIcon deviceType={s.device_type} />
                          <span className="text-sm text-muted-foreground">
                            {s.browser && s.os
                              ? `${s.browser} on ${s.os}`
                              : s.browser || s.os || s.token_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {s.location || s.ip_address ? (
                          <div>
                            <p className="text-sm text-muted-foreground">{s.location || "—"}</p>
                            {s.ip_address && (
                              <p className="text-xs font-mono text-muted-foreground">{s.ip_address}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(s.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {s.last_seen_at
                          ? formatDistanceToNow(new Date(s.last_seen_at), { addSuffix: true })
                          : s.last_used_at
                          ? formatDistanceToNow(new Date(s.last_used_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                            disabled={revoking === s.id}
                            onClick={() =>
                              setConfirmRevoke({ type: "token", id: s.id, label: `token for ${s.user_name}` })
                            }
                          >
                            {revoking === s.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ShieldOff className="h-3 w-3" />
                            )}
                            Revoke
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1"
                            disabled={revoking === s.user_id}
                            onClick={() =>
                              setConfirmRevoke({
                                type: "user",
                                id: s.user_id,
                                label: `all sessions for ${s.user_name}`,
                              })
                            }
                          >
                            {revoking === s.user_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <LogOut className="h-3 w-3" />
                            )}
                            Log Out All
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmRevoke} onOpenChange={() => setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke {confirmRevoke?.type === "user" ? "all sessions" : "session"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the {confirmRevoke?.label}. The user will be signed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!confirmRevoke) return;
                if (confirmRevoke.type === "token") handleRevokeToken(confirmRevoke.id);
                else handleRevokeUser(confirmRevoke.id);
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
