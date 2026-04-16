"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  RefreshCw,
  LifeBuoy,
  Eye,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SupportTicket {
  id: number;
  uuid?: string;
  subject: string;
  description?: string;
  status: string;
  priority?: string;
  category?: string;
  user?: { id: number; name?: string; email?: string };
  assigned_to?: { id: number; name?: string } | null;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
  messages_count?: number;
}

interface SupportStats {
  total?: number;
  open?: number;
  in_progress?: number;
  resolved?: number;
  closed?: number;
  unavailable?: boolean;
}

function statusBadge(status: string) {
  const s = status?.toLowerCase().replace(/_/g, "-");
  if (s === "resolved" || s === "closed")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 capitalize">{status}</Badge>;
  if (s === "in-progress" || s === "in_progress")
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
  if (s === "open")
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Open</Badge>;
  return <Badge variant="outline" className="capitalize">{status}</Badge>;
}

function priorityBadge(priority?: string) {
  if (!priority) return null;
  const p = priority?.toLowerCase();
  if (p === "urgent" || p === "critical")
    return <Badge className="bg-red-100 text-reded-700 hover:bg-red-100 capitalize">{priority}</Badge>;
  if (p === "high")
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 capitalize">{priority}</Badge>;
  if (p === "medium")
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 capitalize">{priority}</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 capitalize">{priority}</Badge>;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const [ticketsData, statsData] = await Promise.allSettled([
        adminService.getSupportTickets(params),
        adminService.getSupportStats(),
      ]);

      if (ticketsData.status === "fulfilled") {
        const raw = (ticketsData.value as any)?.data ?? ticketsData.value;
        setTickets(Array.isArray(raw) ? raw : (raw as any)?.data ?? (raw as any)?.tickets ?? []);
      }
      if (statsData.status === "fulfilled") {
        const raw = (statsData.value as any)?.data ?? statsData.value;
        setStats(raw as any);
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch support tickets", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const statCards = stats
    ? [
        { label: "Total", value: stats.total ?? tickets.length, icon: LifeBuoy, color: "text-foreground" },
        { label: "Open", value: stats.open ?? 0, icon: AlertCircle, color: "text-yellow-600" },
        { label: "In Progress", value: stats.in_progress ?? 0, icon: Clock, color: "text-blue-600" },
        { label: "Resolved", value: (stats.resolved ?? 0) + (stats.closed ?? 0), icon: CheckCircle2, color: "text-green-600" },
      ]
    : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">Read-only view of all platform support requests.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {statCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 opacity-20 ${color}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {stats?.unavailable && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Stats unavailable right now.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LifeBuoy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tickets found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-[220px] truncate">
                      <div className="flex items-center gap-2">
                        {ticket.messages_count !== undefined && ticket.messages_count > 0 && (
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        {ticket.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{ticket.user?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{ticket.user?.email ?? ""}</div>
                    </TableCell>
                    <TableCell>{priorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{statusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.assigned_to?.name ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(ticket)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {statusBadge(selected.status)}
                {priorityBadge(selected.priority)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selected.subject}</p>
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Submitted by</p>
                  <p>{selected.user?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{selected.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Assigned to</p>
                  <p>{selected.assigned_to?.name ?? "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Opened</p>
                  <p>{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                {selected.resolved_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Resolved</p>
                    <p>{new Date(selected.resolved_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
