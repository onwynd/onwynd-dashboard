"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hrService } from "@/lib/api/hr";
import { Loader2, DollarSign, Plus, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PayrollEntry {
  id: number;
  uuid: string;
  user_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  amount: number | string;
  period: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  reference_number: string;
  paid_at: string | null;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

function statusVariant(status: string) {
  switch (status) {
    case "paid":       return "default" as const;
    case "processing": return "secondary" as const;
    case "pending":    return "outline" as const;
    case "failed":     return "destructive" as const;
    default:           return "outline" as const;
  }
}

const emptyForm = {
  user_id: "",
  amount: "",
  period_start: "",
  period_end: "",
  pay_date: "",
  status: "pending",
};

export default function PayrollPage() {
  const [payroll, setPayroll]       = useState<PayrollEntry[]>([]);
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [form, setForm]             = useState(emptyForm);

  const [markingUuid, setMarkingUuid]   = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<PayrollEntry | null>(null);

  const fetchPayroll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getPayroll();
      const rows = (data as any)?.data ?? data;
      setPayroll(Array.isArray(rows) ? rows : []);
    } catch {
      toast({ description: "Failed to load payroll data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await hrService.getEmployees({ per_page: 200 });
      const rows = (data as any)?.data ?? data;
      setEmployees(Array.isArray(rows) ? rows : []);
    } catch {
      // silently — employees list is best-effort for the picker
    }
  }, []);

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, [fetchPayroll, fetchEmployees]);

  const handleCreate = async () => {
    if (!form.user_id || !form.amount || !form.period_start || !form.period_end) {
      toast({ description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await hrService.createPayroll({
        user_id:      Number(form.user_id),
        amount:       Number(form.amount),
        period_start: form.period_start,
        period_end:   form.period_end,
        pay_date:     form.pay_date || undefined,
        status:       form.status,
      });
      toast({ description: "Payroll entry created." });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchPayroll();
    } catch {
      toast({ description: "Failed to create payroll entry.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirmEntry) return;
    setMarkingUuid(confirmEntry.uuid);
    try {
      await hrService.markPayrollPaid(confirmEntry.uuid);
      toast({ description: `${confirmEntry.employee_name}'s payroll marked as paid. Email sent.` });
      fetchPayroll();
    } catch {
      toast({ description: "Failed to mark as paid.", variant: "destructive" });
    } finally {
      setMarkingUuid(null);
      setConfirmEntry(null);
    }
  };

  const totalPending = payroll.filter((p) => p.status === "pending").length;
  const totalPaid    = payroll.filter((p) => p.status === "paid").length;
  const totalAmount  = payroll
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(String(p.amount)) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">Manage Onwynd internal employee paychecks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayroll} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid this batch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPaid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            Onwynd employee payroll entries. Use &quot;Mark as Paid&quot; to disburse and automatically notify the employee by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payroll.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found. Create the first entry above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Ref #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{entry.employee_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.department}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.period}</TableCell>
                    <TableCell className="font-medium">
                      ₦{typeof entry.amount === "number"
                        ? entry.amount.toLocaleString()
                        : parseFloat(String(entry.amount)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {entry.reference_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry.paid_at ? new Date(entry.paid_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {entry.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap"
                          onClick={() => setConfirmEntry(entry)}
                          disabled={markingUuid === entry.uuid}
                        >
                          {markingUuid === entry.uuid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark as Paid
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Entry Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Payroll Entry</DialogTitle>
            <DialogDescription>
              Create a paycheck record for an Onwynd internal employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.user_id}
                onValueChange={(v) => setForm((f) => ({ ...f, user_id: v ?? "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee…" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.first_name} {e.last_name}
                      {e.department ? ` (${e.department})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>
                Amount (₦) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 350000"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Period Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.period_start}
                  onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Period End <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.period_end}
                  onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Pay Date (optional)</Label>
              <Input
                type="date"
                value={form.pay_date}
                onChange={(e) => setForm((f) => ({ ...f, pay_date: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Initial Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "pending" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid confirmation */}
      <AlertDialog
        open={!!confirmEntry}
        onOpenChange={(o) => { if (!o) setConfirmEntry(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{confirmEntry?.employee_name}</strong>&apos;s payroll entry (
              <strong>
                ₦{typeof confirmEntry?.amount === "number"
                  ? confirmEntry.amount.toLocaleString()
                  : parseFloat(String(confirmEntry?.amount ?? "0")).toLocaleString()}
              </strong>
              ) as paid and send them a payslip notification email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid} disabled={!!markingUuid}>
              {markingUuid ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Confirm &amp; Notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
