"use client";

import { useEffect, useState } from "react";
import { ambassadorService } from "@/lib/api/ambassador";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  DollarSign,
  Clock,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Payout {
  id: number | string;
  amount: number | string;
  status: string;
  requested_at: string;
  paid_at?: string;
  method?: string;
}

interface EarningsStats {
  total_earned: number;
  pending: number;
  paid_out: number;
}

function getPayoutStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "pending":
    case "processing":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    case "rejected":
    case "failed":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function EarningsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<EarningsStats>({ total_earned: 0, pending: 0, paid_out: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, payoutsRes] = await Promise.all([
        ambassadorService.getDashboard(),
        ambassadorService.getPayouts(),
      ]);

      const dashData = dashboardRes.data || dashboardRes;
      setStats({
        total_earned: dashData.total_earned ?? dashData.totalEarned ?? 0,
        pending: dashData.pending ?? dashData.pendingEarnings ?? 0,
        paid_out: dashData.paid_out ?? dashData.paidOut ?? 0,
      });

      const payData = payoutsRes.data || payoutsRes;
      const list: Payout[] = Array.isArray(payData) ? payData : payData.data || payData.payouts || [];
      setPayouts(list);
    } catch (error) {
      console.error("Failed to fetch earnings data", error);
      toast({ title: "Error", description: "Failed to fetch earnings data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestPayout = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payout amount.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await ambassadorService.requestPayout({ amount });
      toast({ title: "Success", description: "Payout request submitted successfully." });
      setIsRequestOpen(false);
      setRequestAmount("");
      fetchData();
    } catch (error) {
      console.error("Failed to request payout", error);
      toast({ title: "Error", description: "Failed to submit payout request.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">View your earnings and request payouts.</p>
        </div>
        <Button onClick={() => setIsRequestOpen(true)}>
          <Wallet className="mr-2 h-4 w-4" />
          Request Payout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_earned.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.paid_out.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout history yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">
                      ${typeof payout.amount === "number" ? payout.amount.toFixed(2) : payout.amount}
                    </TableCell>
                    <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                    <TableCell>{payout.requested_at}</TableCell>
                    <TableCell>{payout.paid_at || "-"}</TableCell>
                    <TableCell>{payout.method || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to withdraw. Available balance: ${stats.pending.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestPayout} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
