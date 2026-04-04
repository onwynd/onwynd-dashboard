"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFeedbackService, type FeedbackItem, type FeedbackFilters } from "@/lib/api/admin-feedback.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Trash2,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
    case "reviewed":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Reviewed</Badge>;
    case "resolved":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Resolved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "bug":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Bug</Badge>;
    case "feature":
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Feature</Badge>;
    case "general":
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">General</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<{
    total: number; pending: number; reviewed: number; resolved: number;
    average_rating: number; by_type: { bug: number; feature: number; general: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackFilters["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<FeedbackFilters["type"]>("all");
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminFeedbackService.getFeedback({ status: statusFilter, type: typeFilter });
      const items: FeedbackItem[] = Array.isArray(data)
        ? data
        : (data as { feedback?: FeedbackItem[] }).feedback ?? (data as { data?: FeedbackItem[] }).data ?? [];
      setFeedback(items);
      if ((data as { summary?: typeof summary }).summary) {
        setSummary((data as { summary: typeof summary }).summary);
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch feedback", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (id: number, status: "pending" | "reviewed" | "resolved") => {
    try {
      await adminFeedbackService.updateFeedbackStatus(id, status);
      toast({ title: "Updated", description: `Status set to ${status}.` });
      fetchFeedback();
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this feedback entry?")) return;
    try {
      await adminFeedbackService.deleteFeedback(id);
      toast({ title: "Deleted", description: "Feedback removed." });
      fetchFeedback();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Feedback</h2>
          <p className="text-muted-foreground">Review, triage and resolve user-submitted feedback.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFeedback}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: summary.total, icon: MessageSquare, color: "text-foreground" },
            { label: "Pending", value: summary.pending, icon: Clock, color: "text-yellow-600" },
            { label: "Reviewed", value: summary.reviewed, icon: Eye, color: "text-blue-600" },
            { label: "Resolved", value: summary.resolved, icon: CheckCircle2, color: "text-green-600" },
          ].map(({ label, value, icon: Icon, color }) => (
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter((v ?? "") as FeedbackFilters["status"])}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter((v ?? "") as FeedbackFilters["type"])}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback ({feedback.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No feedback found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      <div className="font-medium">{item.user?.name ?? item.name ?? "Anonymous"}</div>
                      <div className="text-xs text-muted-foreground">{item.user?.email ?? item.email ?? "—"}</div>
                    </TableCell>
                    <TableCell>{typeBadge(item.type)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {item.message}
                    </TableCell>
                    <TableCell>
                      {item.rating ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          {item.rating}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelected(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status !== "reviewed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "reviewed")}>
                              <Eye className="mr-2 h-4 w-4 text-blue-600" />
                              Mark Reviewed
                            </DropdownMenuItem>
                          )}
                          {item.status !== "resolved" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "resolved")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Mark Resolved
                            </DropdownMenuItem>
                          )}
                          {item.status !== "pending" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "pending")}>
                              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                              Reopen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <DialogTitle>Feedback Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {typeBadge(selected.type)}
                {statusBadge(selected.status)}
                {selected.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    {selected.rating} / 5
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="text-sm font-medium">{selected.user?.name ?? selected.name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{selected.user?.email ?? selected.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                {selected.status !== "reviewed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { handleStatusChange(selected.id, "reviewed"); setSelected(null); }}
                  >
                    Mark Reviewed
                  </Button>
                )}
                {selected.status !== "resolved" && (
                  <Button
                    size="sm"
                    onClick={() => { handleStatusChange(selected.id, "resolved"); setSelected(null); }}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
