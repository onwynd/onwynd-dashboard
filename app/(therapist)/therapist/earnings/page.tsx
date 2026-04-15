"use client";

import { useEffect, useState } from "react";
import { FinancialFlowChart } from "@/components/therapist-dashboard/financial-flow-chart";
import { therapistService } from "@/lib/api/therapist";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Loader2, 
  Banknote, 
  X, 
  Percent, 
  ArrowDownToLine,
  Calculator,
  Info
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Payment {
  id: string | number;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  payer_name?: string;
  payer_email?: string;
  created_at: string;
  session_fee?: number;
  commission_rate?: number;
  founding_commission_rate?: number;
  net_amount?: number;
}

interface EarningsData {
  total_earnings: number;
  this_month_earnings: number;
  pending_payout: number;
  currency: string;
  gross_earnings?: number;
  commission_deducted?: number;
  net_earnings?: number;
  commission_rate?: number;
  founding_commission_rate?: number;
  is_founding_therapist?: boolean;
  payment_history: { data: Payment[]; meta?: { total?: number } } | Payment[];
  commission_breakdown?: {
    total_sessions: number;
    total_gross: number;
    total_commission: number;
    founding_discount: number;
    final_net: number;
  };
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string;
  recipient_code?: string;
}

interface PayoutRecord {
  id: number;
  amount: number;
  status: string;
  currency: string;
  created_at: string;
  processed_at?: string;
  failure_reason?: string;
}

const NIGERIAN_BANKS = [
  { code: "058", name: "GTBank" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "057", name: "Zenith Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "076", name: "Skye Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "039", name: "Stanbic IBTC" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "035A", name: "ALAT (Wema Digital)" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "50211", name: "Kuda MFB" },
  { code: "100004", name: "Opay" },
  { code: "100033", name: "Palmpay" },
];

function fmt(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (["successful", "completed", "paid"].includes(status)) return "default";
  if (status === "pending") return "secondary";
  if (["failed", "cancelled"].includes(status)) return "destructive";
  return "outline";
}

// Request Payout Modal
function RequestPayoutModal({
  isOpen,
  availableBalance,
  currency,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  availableBalance: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payout amount.", variant: "destructive" });
      return;
    }
    if (parsed > availableBalance) {
      toast({ title: "Insufficient balance", description: `Max payout is ${fmt(availableBalance, currency)}.`, variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await therapistService.requestPayout(parsed);
      toast({ title: "Payout requested!", description: "Your payout will be processed within 12 business days." });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Payout failed",
        description: err?.response?.data?.message ?? "Please ensure your bank account is saved and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Request Payout</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold">{fmt(availableBalance, currency)}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Amount to Withdraw ({currency})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max: ${fmt(availableBalance, currency)}`}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => setAmount(String(availableBalance))}
            className="text-xs text-primary underline mt-1"
          >
            Withdraw all
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Payouts are sent via Paystack bank transfer to your saved bank account. Processing time: 12 business days.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleRequest} disabled={loading} className="flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Processing" : "Request Payout"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Bank Account Section
function BankAccountSection() {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_code: "", account_number: "", account_name: "", bank_name: "" });

  useEffect(() => {
    therapistService.getBankAccount()
      .then((data: any) => {
        if (data) {
          setBankAccount(data);
          setForm({
            bank_code: data.bank_code ?? "",
            account_number: data.account_number ?? "",
            account_name: data.account_name ?? "",
            bank_name: data.bank_name ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.bank_code || !form.account_number || !form.account_name) {
      toast({ title: "Missing fields", description: "All bank details are required.", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const selectedBank = NIGERIAN_BANKS.find((b) => b.code === form.bank_code);
      const payload = { ...form, bank_name: selectedBank?.name ?? form.bank_name };
      await therapistService.saveBankAccount(payload);
      setBankAccount(payload as BankAccount);
      toast({ title: "Bank account saved!", description: "Your payout details have been saved successfully." });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err?.response?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="w-5 h-5" />
          Payout Bank Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bankAccount?.recipient_code && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
            <span></span>
            <span>Paystack transfer recipient is configured. Payouts will be sent automatically.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Bank</label>
            <select
              value={form.bank_code}
              onChange={(e) => setForm((p) => ({ ...p, bank_code: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="">Select bank</option>
              {NIGERIAN_BANKS.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Account Number</label>
            <input
              type="text"
              maxLength={10}
              value={form.account_number}
              onChange={(e) => setForm((p) => ({ ...p, account_number: e.target.value.replace(/\D/g, "") }))}
              placeholder="10-digit NUBAN"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1">Account Name</label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) => setForm((p) => ({ ...p, account_name: e.target.value }))}
              placeholder="As it appears on your bank statement"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {saving ? "Saving" : "Save Bank Account"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Your account details are encrypted and used exclusively for Paystack bank transfers.
        </p>
      </CardContent>
    </Card>
  );
}

// Commission Breakdown Section
function CommissionBreakdown({ breakdown }: { breakdown?: any }) {
  if (!breakdown) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-5 h-5" />
          Commission Breakdown
          <Info className="w-4 h-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <span className="font-medium">{breakdown.total_sessions}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Gross Earnings</span>
            <span className="font-medium">{fmt(breakdown.total_gross)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Platform Commission</span>
            <span className="font-medium text-red-600">-{fmt(breakdown.total_commission)}</span>
          </div>
          {breakdown.founding_discount > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Founding Therapist Discount</span>
              <span className="font-medium text-green-600">+{fmt(breakdown.founding_discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 font-bold">
            <span>Final Net Earnings</span>
            <span className="text-green-600">{fmt(breakdown.final_net)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Payout History
function PayoutHistory() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    therapistService.getPayouts({ per_page: 10 })
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setPayouts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-20 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (payouts.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No payouts requested yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Processed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{format(new Date(p.created_at), "dd MMM yyyy")}</TableCell>
            <TableCell className="font-semibold">{fmt(p.amount, p.currency)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {p.processed_at ? format(new Date(p.processed_at), "dd MMM yyyy") : ""}
              {p.failure_reason && (
                <span className="block text-xs text-destructive">{p.failure_reason}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Page
export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const fetchEarnings = () => {
    therapistService.getEarnings({ per_page: 20 })
      .then((res: any) => setData(res as EarningsData | null))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEarnings(); }, []);

  const totalEarnings = data?.total_earnings ?? 0;
  const monthEarnings = data?.this_month_earnings ?? 0;
  const pendingPayout = data?.pending_payout ?? 0;
  const currency = data?.currency ?? "NGN";
  const grossEarnings = data?.gross_earnings ?? totalEarnings;
  const commissionDeducted = data?.commission_deducted ?? 0;
  const netEarnings = data?.net_earnings ?? totalEarnings;
  const commissionRate = data?.commission_rate ?? null;
  const foundingCommissionRate = data?.founding_commission_rate ?? null;
  const isFoundingTherapist = data?.is_founding_therapist ?? false;
  const payments: Payment[] = Array.isArray(data?.payment_history)
    ? (data!.payment_history as Payment[])
    : ((data?.payment_history as { data: Payment[] })?.data ?? []);

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Earnings & Finance</h2>
          <p className="text-muted-foreground">Track your therapy session earnings and commission breakdown</p>
        </div>
        <Button
          onClick={() => setShowPayoutModal(true)}
          disabled={pendingPayout <= 0 && totalEarnings <= 0}
        >
          Request Payout
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Enhanced Stat Cards with Commission Breakdown */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Earnings</p>
                <p className="text-2xl font-bold">{fmt(grossEarnings, currency)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Before platform commission</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Deducted</p>
                <p className="text-2xl font-bold">{fmt(commissionDeducted, currency)}</p>
                {commissionRate !== null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {commissionRate}% platform fee
                    {isFoundingTherapist && foundingCommissionRate && (
                      <span className="text-green-600 ml-1">(Founding: {foundingCommissionRate}%)</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <ArrowDownToLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Earnings</p>
                <p className="text-2xl font-bold">{fmt(netEarnings, currency)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">After commission</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{fmt(monthEarnings, currency)}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
              <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold">{fmt(pendingPayout, currency)}</p>
                {pendingPayout > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="text-xs text-primary underline mt-0.5"
                  >
                    Request now →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Commission Breakdown Section */}
          {data?.commission_breakdown && (
            <CommissionBreakdown breakdown={data.commission_breakdown} />
          )}

          {/* Chart */}
          {payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                <FinancialFlowChart />
              </CardContent>
            </Card>
          )}

          {/* Bank Account Settings */}
          <BankAccountSection />

          {/* Payout History */}
          <Card>
            <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
            <CardContent><PayoutHistory /></CardContent>
          </Card>

          {/* Enhanced Payment History with Commission Details */}
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No payments yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session Fee</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{format(new Date(p.created_at), "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-semibold">{fmt(p.session_fee || p.amount, p.currency)}</TableCell>
                        <TableCell className="text-red-600">
                          -{fmt((p.session_fee || p.amount) - (p.net_amount || p.amount), p.currency)}
                          {p.commission_rate && (
                            <span className="text-xs text-muted-foreground ml-1">({p.commission_rate}%)</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">{fmt(p.net_amount || p.amount, p.currency)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.payer_name ?? p.description ?? ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={showPayoutModal}
        availableBalance={pendingPayout > 0 ? pendingPayout : totalEarnings}
        currency={currency}
        onClose={() => setShowPayoutModal(false)}
        onSuccess={fetchEarnings}
      />
    </div>
  );
}