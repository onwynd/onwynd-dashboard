"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { salesService } from "@/lib/api/sales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ThumbsDown,
  ThumbsUp,
  User,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function CloserDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toast } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const result = await salesService.getCloserDashboard();
      setData(result);
    } catch {
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [wonRes, lostRes] = await Promise.all([
        salesService.getDeals({ status: "closed_won" }),
        salesService.getDeals({ status: "closed_lost" }),
      ]) as any[];
      const wonList = Array.isArray(wonRes.data) ? wonRes.data : (wonRes.data?.data ?? []);
      const lostList = Array.isArray(lostRes.data) ? lostRes.data : (lostRes.data?.data ?? []);
      setHistory([...wonList, ...lostList].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch {
      toast({ description: "Failed to load closed deals history.", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleMarkWon = async (id: string) => {
    try {
      await salesService.markDealWon(id);
      toast({ title: "Success", description: "Deal marked as Closed-Won. Organization created." });
      fetchDashboard();
    } catch {
      toast({ title: "Error", description: "Failed to close deal", variant: "destructive" });
    }
  };

  const handleMarkLost = async (id: string, reason: string) => {
    try {
      await salesService.markDealLost(id, reason);
      toast({ title: "Success", description: "Deal marked as Closed-Lost." });
      fetchDashboard();
    } catch {
      toast({ title: "Error", description: "Failed to close deal", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data</div>;
  }

  const { awaiting_action, pipeline, performance } = data;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Closer Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={(tab) => { if (tab === "history") fetchHistory(); }}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Active Pipeline</TabsTrigger>
          <TabsTrigger value="history">My Closed Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{performance?.this_month?.value?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{performance?.this_month?.count} deals won</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed This Quarter</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{performance?.this_quarter?.value?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{performance?.this_quarter?.count} deals won</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Close Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance?.close_rate}%</div>
                <p className="text-xs text-muted-foreground">All time win rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{awaiting_action?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Deals waiting 48h+</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Required Panel */}
          {awaiting_action?.length > 0 && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Action Required: Stale Handoffs
                </CardTitle>
                <CardDescription>
                  These deals were handed off to you but have had no activity for over 48 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Handed Off By</TableHead>
                      <TableHead>Waiting Since</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {awaiting_action.map((deal: any) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">
                          {deal.title}
                          <div className="text-xs text-muted-foreground">{deal.lead?.company_name}</div>
                        </TableCell>
                        <TableCell>₦{deal.value?.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {deal.assigned_user?.name || "Unassigned"}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(deal.updated_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/sales/deals/${deal.id}`)}>
                            View Deal
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Active Pipeline Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Active Pipeline (Closer Stage)</CardTitle>
              <CardDescription>Deals currently in Proposal or Negotiation stage.</CardDescription>
            </CardHeader>
            <CardContent>
              <DealList deals={pipeline} onMarkWon={handleMarkWon} onMarkLost={handleMarkLost} onView={(id) => router.push(`/sales/deals/${id}`)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Full Active Pipeline</CardTitle>
              <CardDescription>All deals currently in your court.</CardDescription>
            </CardHeader>
            <CardContent>
              <DealList deals={pipeline} onMarkWon={handleMarkWon} onMarkLost={handleMarkLost} onView={(id) => router.push(`/sales/deals/${id}`)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>My Closed Deals</CardTitle>
              <CardDescription>All deals you have closed — won and lost.</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">No closed deals yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Closed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((deal: any) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">
                          {deal.title}
                          <div className="text-xs text-muted-foreground">{deal.lead?.company_name}</div>
                        </TableCell>
                        <TableCell>₦{deal.value?.toLocaleString()}</TableCell>
                        <TableCell>
                          {deal.stage === "closed_won" ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Won
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" /> Lost
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {deal.lost_reason ? deal.lost_reason.replace(/_/g, " ") : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {deal.updated_at ? format(new Date(deal.updated_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DealList({
  deals,
  onMarkWon,
  onMarkLost,
  onView,
}: {
  deals: any[];
  onMarkWon: (id: string) => void;
  onMarkLost: (id: string, reason: string) => void;
  onView: (id: string) => void;
}) {
  const [lostDialogOpen, setLostDialogOpen] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const { toast } = useToast();

  if (!deals || deals.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No active deals found.</div>;
  }

  function handleConfirmLost() {
    if (!lostReason) {
      toast({ description: "Please select a reason before confirming.", variant: "destructive" });
      return;
    }
    if (lostDialogOpen) {
      onMarkLost(lostDialogOpen, lostReason);
      setLostDialogOpen(null);
      setLostReason("");
    }
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <Card key={deal.id} className="overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{deal.title}</h3>
                <Badge variant={deal.stage === "contract_ready" ? "default" : "secondary"}>
                  {deal.stage.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {deal.lead?.company_name} • {deal.lead?.industry}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {deal.lead?.first_name} {deal.lead?.last_name}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> ₦{deal.value?.toLocaleString()}
                </span>
                {deal.handoff_note && (
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    <FileText className="h-3 w-3" /> Handoff Note
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onMarkWon(deal.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" /> Won
              </Button>

              <Dialog open={lostDialogOpen === deal.id} onOpenChange={(open) => { if (!open) { setLostDialogOpen(null); setLostReason(""); } }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => { setLostDialogOpen(deal.id); setLostReason(""); }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" /> Lost
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Deal as Lost</DialogTitle>
                    <DialogDescription>
                      Please select a reason for losing this deal. This helps us improve our sales process.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason *</Label>
                      <Select value={lostReason} onValueChange={(v) => v !== null && setLostReason(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Budget Issue</SelectItem>
                          <SelectItem value="competitor">Competitor</SelectItem>
                          <SelectItem value="timing">Bad Timing</SelectItem>
                          <SelectItem value="no_decision">No Decision Made</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setLostDialogOpen(null); setLostReason(""); }}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirmLost} disabled={!lostReason}>
                      Confirm Lost
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button size="sm" variant="default" onClick={() => onView(deal.id)}>
                View Details
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
