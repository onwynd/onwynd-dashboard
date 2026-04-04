"use client";

import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Users, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2,
  Landmark, TrendingUp, Search,
} from "lucide-react";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface SalaryRecord {
  id: number;
  user_id: number;
  employee_name: string;
  employee_email: string;
  base_salary: number;
  currency: string;
  role_label: string | null;
  department: string | null;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
  set_by: string | null;
}

interface Summary {
  monthly_payroll: number;
  annual_payroll: number;
  headcount: number;
  by_department: { department: string | null; total: number; headcount: number }[];
}

interface InternalUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: { name?: string };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toFixed(2)}`;
}

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Sales", "Marketing",
  "Finance", "HR", "Operations", "Clinical", "Legal", "Executive",
];

export default function SalaryManagementPage() {
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // User picker
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    user_id: "",
    base_salary: "",
    currency: "NGN",
    role_label: "",
    department: "",
    effective_from: format(new Date(), "yyyy-MM-dd"),
    effective_to: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [salRes, sumRes] = await Promise.all([
        client.get("/api/v1/admin/employee-salaries"),
        client.get("/api/v1/admin/employee-salaries/summary"),
      ]);
      setSalaries(salRes.data?.data?.data ?? salRes.data?.data ?? []);
      setSummary(sumRes.data?.data ?? null);
    } catch {
      toast({ description: "Failed to load salary data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await client.get("/api/v1/admin/users", { params: { per_page: 200 } });
      const list = res.data?.data?.data ?? res.data?.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { load(); loadUsers(); }, [load, loadUsers]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ user_id: "", base_salary: "", currency: "NGN", role_label: "", department: "", effective_from: format(new Date(), "yyyy-MM-dd"), effective_to: "", notes: "" });
    setUserSearch("");
    setDialogOpen(true);
  };

  const openEdit = (s: SalaryRecord) => {
    setEditingId(s.id);
    setForm({
      user_id: String(s.user_id),
      base_salary: String(s.base_salary),
      currency: s.currency,
      role_label: s.role_label ?? "",
      department: s.department ?? "",
      effective_from: s.effective_from,
      effective_to: s.effective_to ?? "",
      notes: s.notes ?? "",
    });
    setUserSearch(s.employee_name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.user_id || !form.base_salary || !form.effective_from) {
      toast({ description: "Employee, salary, and effective date are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: Number(form.user_id),
        base_salary: Number(form.base_salary),
        currency: form.currency || "NGN",
        role_label: form.role_label || null,
        department: form.department || null,
        effective_from: form.effective_from,
        effective_to: form.effective_to || null,
        notes: form.notes || null,
      };
      if (editingId) {
        await client.put(`/api/v1/admin/employee-salaries/${editingId}`, payload);
        toast({ description: "Salary updated" });
      } else {
        await client.post("/api/v1/admin/employee-salaries", payload);
        toast({ description: "Salary record created" });
      }
      setDialogOpen(false);
      load();
    } catch {
      toast({ description: "Failed to save salary record", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove salary record for ${name}?`)) return;
    try {
      await client.delete(`/api/v1/admin/employee-salaries/${id}`);
      toast({ description: "Record deleted" });
      load();
    } catch {
      toast({ description: "Failed to delete", variant: "destructive" });
    }
  };

  const filtered = salaries.filter(s =>
    !search ||
    s.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.role_label?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !userSearch ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            Salary Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure internal employee salaries. These flow directly into Financial Statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Salary
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Monthly Payroll</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-red-600">{fmt(summary.monthly_payroll)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Annual Payroll</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{fmt(summary.annual_payroll)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Headcount</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{summary.headcount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Avg. Monthly Salary</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-teal">
                {summary.headcount > 0 ? fmt(summary.monthly_payroll / summary.headcount) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dept breakdown */}
      {summary && summary.by_department.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> By Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.by_department.map(d => (
                <div key={d.department ?? "Other"} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                  <span className="font-medium">{d.department ?? "Unassigned"}</span>
                  <Badge variant="secondary">{d.headcount} people</Badge>
                  <span className="text-muted-foreground">{fmt(d.total)}/mo</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">Active Salary Records</CardTitle>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-8 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Title / Dept</TableHead>
                  <TableHead className="text-right">Monthly Salary</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead>Set by</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      No salary records found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{s.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{s.employee_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{s.role_label ?? "—"}</div>
                      {s.department && <Badge variant="outline" className="text-xs mt-0.5">{s.department}</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{fmt(s.base_salary)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.effective_from ? (() => { try { return format(parseISO(s.effective_from), "d MMM yyyy"); } catch { return s.effective_from; } })() : "—"}
                      {s.effective_to && <> → {(() => { try { return format(parseISO(s.effective_to), "d MMM yyyy"); } catch { return s.effective_to; } })()}</>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.set_by ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(s)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(s.id, s.employee_name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Salary Record" : "Add Salary Record"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {/* Employee picker */}
            <div className="grid gap-1.5">
              <Label>Employee *</Label>
              <Input
                placeholder="Search name or email…"
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setForm(f => ({ ...f, user_id: "" })); }}
              />
              {userSearch && !form.user_id && filteredUsers.length > 0 && (
                <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setForm(f => ({ ...f, user_id: String(u.id), role_label: f.role_label || (u.role?.name ?? "") }));
                        setUserSearch(`${u.first_name} ${u.last_name}`);
                      }}
                    >
                      <span className="font-medium">{u.first_name} {u.last_name}</span>
                      <span className="text-muted-foreground ml-2">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.user_id && (
                <Badge className="self-start bg-green-100 text-green-800 border-0">Employee selected ✓</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Monthly salary */}
              <div className="grid gap-1.5">
                <Label>Monthly Gross Salary *</Label>
                <Input
                  type="number" min={0} placeholder="e.g. 850000"
                  value={form.base_salary}
                  onChange={e => setForm(f => ({ ...f, base_salary: e.target.value }))}
                />
              </div>
              {/* Currency */}
              <div className="grid gap-1.5">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="NGN" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Role label */}
              <div className="grid gap-1.5">
                <Label>Job Title</Label>
                <Input placeholder="e.g. Senior Engineer" value={form.role_label} onChange={e => setForm(f => ({ ...f, role_label: e.target.value }))} />
              </div>
              {/* Department */}
              <div className="grid gap-1.5">
                <Label>Department</Label>
                <Input list="dept-list" placeholder="Engineering" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                <datalist id="dept-list">
                  {DEPARTMENTS.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Effective From *</Label>
                <Input type="date" value={form.effective_from} onChange={e => setForm(f => ({ ...f, effective_from: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Effective To <span className="text-muted-foreground text-xs">(leave blank = active)</span></Label>
                <Input type="date" value={form.effective_to} onChange={e => setForm(f => ({ ...f, effective_to: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea placeholder="Reason for change, contract terms…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.user_id || !form.base_salary}>
              {saving ? "Saving…" : editingId ? "Update" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
