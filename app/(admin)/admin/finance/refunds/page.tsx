"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, MoreHorizontal, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed:           "text-green-700 bg-green-50",
  paid:                "text-green-700 bg-green-50",
  refunded:            "text-blue-700 bg-blue-50",
  partially_refunded:  "text-yellow-700 bg-yellow-50",
  disputed:            "text-red-700 bg-red-50",
  failed:              "text-gray-600 bg-gray-100",
  pending:             "text-orange-700 bg-orange-50",
};

function fmt(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

interface Payment {
  id: number;
  payment_reference: string;
  amount: number;
  currency: string;
  status: string;
  payment_gateway: string;
  refund_amount?: number;
  refunded_at?: string;
  created_at: string;
  user?: { first_name: string; last_name: string; email: string };
}

export default function RefundsDisputesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("refunds");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Refund dialog state
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  // Dispute dialog state
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState<Payment | null>(null);
  const [disputeAction, setDisputeAction] = useState<"flag" | "resolve" | "accept">("resolve");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fn = tab === "disputes"
        ? adminService.getAdminDisputes.bind(adminService)
        : adminService.getAdminRefunds.bind(adminService);
      const data = await fn({ search: search || undefined });
      setPayments(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [tab, search, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openRefundDialog = (p: Payment) => {
    setRefundTarget(p);
    setRefundAmount(String(p.amount));
    setRefundReason("");
    setRefundOpen(true);
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefundLoading(true);
    try {
      await adminService.issueRefund(refundTarget.id, {
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason || undefined,
      });
      toast({ title: "Refund issued", description: `Refund of ${fmt(parseFloat(refundAmount || String(refundTarget.amount)), refundTarget.currency)} processed.` });
      setRefundOpen(false);
      fetchData();
    } catch {
      toast({ title: "Refund failed", description: "Could not process refund.", variant: "destructive" });
    } finally {
      setRefundLoading(false);
    }
  };

  const openDisputeDialog = (p: Payment, action: "flag" | "resolve" | "accept") => {
    setDisputeTarget(p);
    setDisputeAction(action);
    setDisputeNotes("");
    setDisputeOpen(true);
  };

  const handleDispute = async () => {
    if (!disputeTarget) return;
    setDisputeLoading(true);
    try {
      await adminService.updateDispute(disputeTarget.id, { action: disputeAction, notes: disputeNotes || undefined });
      toast({ title: "Updated", description: `Dispute ${disputeAction}d.` });
      setDisputeOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update dispute.", variant: "destructive" });
    } finally {
      setDisputeLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Refunds & Disputes</h1>
        <p className="text-muted-foreground">Manage payment refunds and customer disputes.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="refunds" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refunds
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Disputes
          </TabsTrigger>
        </TabsList>

        {(["refunds", "disputes"] as const).map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by reference or user..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t === "disputes" ? "Disputed Payments" : "Refunded Payments"} ({payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                  </div>
                ) : payments.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No {t} found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        {t === "refunds" && <TableHead>Refunded</TableHead>}
                        <TableHead>Gateway</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.payment_reference}</TableCell>
                          <TableCell>
                            {p.user ? (
                              <div>
                                <p className="text-sm font-medium">{p.user.first_name} {p.user.last_name}</p>
                                <p className="text-xs text-muted-foreground">{p.user.email}</p>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell>{fmt(p.amount, p.currency)}</TableCell>
                          {t === "refunds" && (
                            <TableCell className="text-blue-700">
                              {p.refund_amount ? fmt(p.refund_amount, p.currency) : "—"}
                            </TableCell>
                          )}
                          <TableCell className="capitalize">{p.payment_gateway ?? "—"}</TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100"}`}>
                              {p.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {t === "refunds" ? (
                                  <DropdownMenuItem onClick={() => openRefundDialog(p)}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Issue Refund
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => openDisputeDialog(p, "resolve")}>
                                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Resolve (keep payment)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDisputeDialog(p, "accept")}>
                                      <RefreshCw className="mr-2 h-4 w-4 text-blue-600" /> Accept (issue refund)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDisputeDialog(p, "flag")}>
                                      <XCircle className="mr-2 h-4 w-4 text-red-600" /> Flag as Disputed
                                    </DropdownMenuItem>
                                  </>
                                )}
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Refund payment {refundTarget?.payment_reference} — original amount:{" "}
              {refundTarget && fmt(refundTarget.amount, refundTarget.currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Refund Amount</label>
              <Input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Max: ${refundTarget?.amount}`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Reason for refund (optional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button onClick={handleRefund} disabled={refundLoading}>
              {refundLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {disputeAction === "resolve" ? "Resolve Dispute" : disputeAction === "accept" ? "Accept Dispute & Refund" : "Flag as Disputed"}
            </DialogTitle>
            <DialogDescription>Payment: {disputeTarget?.payment_reference}</DialogDescription>
          </DialogHeader>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Add notes about this decision..."
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDispute}
              disabled={disputeLoading}
              variant={disputeAction === "accept" ? "default" : disputeAction === "flag" ? "destructive" : "default"}
            >
              {disputeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
