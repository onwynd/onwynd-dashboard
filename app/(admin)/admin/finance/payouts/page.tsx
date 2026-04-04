"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  RefreshCw,
  DollarSign,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Payout {
  id: number;
  uuid?: string;
  recipient_name?: string;
  recipient_email?: string;
  amount: number;
  currency?: string;
  status: string;
  method?: string;
  reference?: string;
  processed_at?: string | null;
  created_at: string;
}

function statusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "processed":
    case "completed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 capitalize">{status}</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
  }
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);

  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminService.getPayouts(params);
      const list: Payout[] = Array.isArray(data) ? data : [];
      setPayouts(list);
    } catch {
      toast({ title: "Error", description: "Failed to fetch payouts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleProcess = async (id: number) => {
    try {
      await adminService.processPayout(id);
      toast({ title: "Success", description: "Payout processed." });
      fetchPayouts();
    } catch {
      toast({ title: "Error", description: "Failed to process payout.", variant: "destructive" });
    }
  };

  const handleBatchProcess = async () => {
    if (selected.length === 0) return;
    try {
      await adminService.batchPayouts(selected);
      toast({ title: "Success", description: `${selected.length} payouts processed.` });
      setSelected([]);
      fetchPayouts();
    } catch {
      toast({ title: "Error", description: "Batch process failed.", variant: "destructive" });
    }
  };

  const fmt = (n: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n ?? 0);

  const pending = payouts.filter((p) => p.status?.toLowerCase() === "pending");
  const totalPending = pending.reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>
          <p className="text-muted-foreground">Manage therapist and partner payout requests.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button size="sm" onClick={handleBatchProcess}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Process {selected.length} Selected
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={fetchPayouts} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Payouts</p>
              <p className="text-2xl font-bold">{payouts.length}</p>
            </div>
            <DollarSign className="h-8 w-8 opacity-20 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pending.length}</p>
            </div>
            <Clock className="h-8 w-8 opacity-20 text-yellow-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold">{fmt(totalPending)}</p>
            </div>
            <AlertCircle className="h-8 w-8 opacity-20 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests ({payouts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout requests found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selected.length === pending.length && pending.length > 0}
                      onChange={(e) =>
                        setSelected(e.target.checked ? pending.map((p) => p.id) : [])
                      }
                    />
                  </TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {payout.status?.toLowerCase() === "pending" && (
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selected.includes(payout.id)}
                          onChange={(e) =>
                            setSelected((prev) =>
                              e.target.checked ? [...prev, payout.id] : prev.filter((id) => id !== payout.id)
                            )
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{payout.recipient_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{payout.recipient_email ?? "—"}</div>
                    </TableCell>
                    <TableCell className="font-medium">{fmt(payout.amount, payout.currency)}</TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">{payout.method ?? "—"}</TableCell>
                    <TableCell>{statusBadge(payout.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status?.toLowerCase() === "pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleProcess(payout.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Process Payout
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
