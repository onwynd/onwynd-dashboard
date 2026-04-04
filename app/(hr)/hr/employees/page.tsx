"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusCircle, Users, Pencil, Archive, RotateCcw,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import client from "@/lib/api/client";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { usePageView } from "@/hooks/usePageView";
import { format } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Department  { id: number; name: string; code: string }
interface Designation { id: number; title: string; level: number }
interface Manager     { id: number; first_name: string; last_name: string }

interface EmployeeRecord {
  id: number;
  employee_number: string;
  employment_status: "active" | "probation" | "on_leave" | "suspended" | "resigned" | "terminated";
  contract_type: string;
  work_mode: "onsite" | "remote" | "hybrid";
  join_date: string | null;
  deleted_at?: string | null;
  current_salary?: number | null;
  user: { id: number; first_name: string; last_name: string; email: string; is_active: boolean };
  department: Department | null;
  designation: Designation | null;
  manager: Manager | null;
}

interface Meta { current_page: number; last_page: number; total: number; per_page: number }

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  active:      "bg-green-100 text-green-700",
  probation:   "bg-yellow-100 text-yellow-700",
  on_leave:    "bg-blue-100 text-blue-700",
  suspended:   "bg-orange-100 text-orange-700",
  resigned:    "bg-gray-100 text-gray-500",
  terminated:  "bg-red-100 text-red-600",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Active", probation: "Probation", on_leave: "On Leave",
  suspended: "Suspended", resigned: "Resigned", terminated: "Terminated",
};
const CONTRACT_LABEL: Record<string, string> = {
  permanent: "Full-time", part_time: "Part-time", contract: "Contractor",
  internship: "Intern", consultant: "Consultant",
  full_time: "Full-time", contractor: "Contractor", intern: "Intern",
};

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", department_id: "", designation_id: "",
  manager_id: "", contract_type: "full_time", work_mode: "onsite",
  employment_status: "active", join_date: "", current_salary: "",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  usePageView("hr.employees");

  // View mode: "active" = live records, "archived" = soft-deleted
  const [viewMode, setViewMode]           = useState<"active" | "archived">("active");

  const [records, setRecords]             = useState<EmployeeRecord[]>([]);
  const [meta, setMeta]                   = useState<Meta | null>(null);
  const [departments, setDepartments]     = useState<Department[]>([]);
  const [designations, setDesignations]   = useState<Designation[]>([]);
  const [managers, setManagers]           = useState<{ id: number; first_name: string; last_name: string }[]>([]);
  const [isLoading, setIsLoading]         = useState(false);

  const [search, setSearch]               = useState("");
  const [deptFilter, setDeptFilter]       = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [page, setPage]                   = useState(1);

  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState<EmployeeRecord | null>(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);

  // ── Data loading ─────────────────────────────────────────────────────────────

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      if (viewMode === "archived") {
        const params: Record<string, unknown> = { page };
        if (search) params.search = search;
        const res = await client.get("/api/v1/hr/employee-records/archived", { params });
        const data = res.data;
        if (data?.data) {
          setRecords(data.data);
          setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page });
        } else {
          setRecords(Array.isArray(data) ? data : []);
          setMeta(null);
        }
      } else {
        const params: Record<string, unknown> = { page };
        if (search) params.search = search;
        if (deptFilter) params.department_id = deptFilter;
        if (statusFilter) params.employment_status = statusFilter;
        const res = await client.get("/api/v1/hr/employee-records", { params });
        const data = res.data;
        if (data?.data) {
          setRecords(data.data);
          setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page });
        } else {
          setRecords(Array.isArray(data) ? data : []);
          setMeta(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, deptFilter, statusFilter, viewMode]);

  const loadOptions = async () => {
    try {
      const [dRes, desRes] = await Promise.all([
        client.get("/api/v1/hr/departments"),
        client.get("/api/v1/hr/designations"),
      ]);
      setDepartments(dRes.data ?? []);
      setDesignations(desRes.data ?? []);
    } catch { /* non-blocking */ }
  };

  const loadManagers = async (deptId?: string) => {
    try {
      const params: Record<string, unknown> = { per_page: 200 };
      if (deptId) params.department_id = deptId;
      const res = await client.get("/api/v1/hr/employee-records", { params });
      const items = res.data?.data ?? res.data ?? [];
      setManagers(
        (Array.isArray(items) ? items : []).map((e: EmployeeRecord) => ({
          id: e.user.id, first_name: e.user.first_name, last_name: e.user.last_name,
        }))
      );
    } catch { /* non-blocking */ }
  };

  useEffect(() => { loadOptions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Reset page when switching modes
  const switchMode = (mode: "active" | "archived") => {
    setViewMode(mode);
    setPage(1);
    setSearch("");
  };

  // ── Form helpers ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    loadManagers();
    setShowForm(true);
  };

  const openEdit = (r: EmployeeRecord) => {
    setEditing(r);
    setForm({
      first_name: r.user.first_name,
      last_name: r.user.last_name,
      email: r.user.email,
      department_id: r.department?.id?.toString() ?? "",
      designation_id: r.designation?.id?.toString() ?? "",
      manager_id: r.manager?.id?.toString() ?? "",
      contract_type: r.contract_type,
      work_mode: r.work_mode,
      employment_status: r.employment_status,
      join_date: r.join_date ?? "",
      current_salary: r.current_salary?.toString() ?? "",
    });
    loadManagers(r.department?.id?.toString());
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        contract_type: form.contract_type,
        work_mode: form.work_mode,
        employment_status: form.employment_status,
        department_id: form.department_id ? parseInt(form.department_id) : null,
        designation_id: form.designation_id ? parseInt(form.designation_id) : null,
        manager_id: form.manager_id ? parseInt(form.manager_id) : null,
        join_date: form.join_date || null,
        current_salary: form.current_salary ? parseFloat(form.current_salary) : null,
      };
      if (editing) {
        await client.put(`/api/v1/hr/employee-records/${editing.id}`, payload);
      } else {
        await client.post("/api/v1/hr/employee-records", payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      loadRecords();
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: number, name: string) => {
    if (!confirm(`Archive ${name}'s record? It can be restored later by an admin or CEO.`)) return;
    await client.delete(`/api/v1/hr/employee-records/${id}`);
    loadRecords();
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`Restore ${name}'s record?`)) return;
    await client.post(`/api/v1/hr/employee-records/${id}/restore`);
    loadRecords();
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} ${viewMode === "archived" ? "archived" : "employee"} records` : "Staff directory and records."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Active / Archived toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-sm">
            <button
              onClick={() => switchMode("active")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === "active" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => switchMode("archived")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "archived" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive size={13} />
              Archived
            </button>
          </div>

          {viewMode === "active" && (
            <PermissionGate resource="hr" permission="write">
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <PlusCircle size={16} /> Add Employee
              </button>
            </PermissionGate>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {viewMode === "active" && (
          <>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && viewMode === "active" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">
            {editing ? "Edit Employee Record" : "Add Employee"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select value={form.department_id}
                onChange={(e) => { setForm({ ...form, department_id: e.target.value, manager_id: "" }); loadManagers(e.target.value); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Designation</label>
              <select value={form.designation_id}
                onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="">— None —</option>
                {designations.map((d) => <option key={d.id} value={d.id}>L{d.level} · {d.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Reporting Manager</label>
              <select value={form.manager_id}
                onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="">— None —</option>
                {managers.filter((m) => !editing || m.id !== editing.user.id).map((m) => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Contract Type</label>
              <select value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contractor">Contractor</option>
                <option value="intern">Intern</option>
                <option value="consultant">Consultant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Work Mode</label>
              <select value={form.work_mode}
                onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Employment Status</label>
              <select value={form.employment_status}
                onChange={(e) => setForm({ ...form, employment_status: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Join Date</label>
              <input type="date" value={form.join_date}
                onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Salary (₦)</label>
              <input type="number" value={form.current_salary}
                onChange={(e) => setForm({ ...form, current_salary: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                placeholder="0" min={0} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              disabled={saving || !form.first_name || !form.last_name || !form.email}
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Archived banner */}
      {viewMode === "archived" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          <Archive size={16} className="shrink-0" />
          These records have been archived and are hidden from the active directory. Admins and the CEO can restore them.
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          <Users size={36} className="mx-auto mb-3 text-muted-foreground/40" />
          {viewMode === "archived" ? "No archived records." : "No employee records found."}
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Employee</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Designation</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Manager</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Contract</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">
                    {viewMode === "archived" ? "Archived" : "Joined"}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => {
                  const fullName = `${r.user.first_name} ${r.user.last_name}`;
                  return (
                    <tr key={r.id} className={`transition-colors ${viewMode === "archived" ? "bg-muted/10 opacity-75" : "bg-card hover:bg-muted/20"}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{r.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {r.employee_number}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.department?.name ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.designation ? (
                          <span>{r.designation.title}<span className="ml-1 text-[10px] text-muted-foreground">L{r.designation.level}</span></span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.manager ? `${r.manager.first_name} ${r.manager.last_name}` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {CONTRACT_LABEL[r.contract_type] ?? r.contract_type}
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{r.work_mode}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {viewMode === "archived"
                          ? (r.deleted_at ? format(new Date(r.deleted_at), "dd MMM yyyy") : "—")
                          : (r.join_date ? format(new Date(r.join_date), "dd MMM yyyy") : "—")}
                      </td>
                      <td className="px-4 py-3">
                        {viewMode === "archived" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">
                            Archived
                          </span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[r.employment_status] ?? "bg-muted text-muted-foreground"}`}>
                            {STATUS_LABEL[r.employment_status] ?? r.employment_status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          {viewMode === "active" ? (
                            <>
                              <PermissionGate resource="hr" permission="update">
                                <button onClick={() => openEdit(r)}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit">
                                  <Pencil size={13} />
                                </button>
                              </PermissionGate>
                              <PermissionGate resource="hr" permission="delete">
                                <button
                                  onClick={() => handleArchive(r.id, fullName)}
                                  className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                                  title="Archive (recoverable)">
                                  <Archive size={13} />
                                </button>
                              </PermissionGate>
                            </>
                          ) : (
                            /* Restore — admin/ceo only, using permission "delete" as the gate since it's a privileged action */
                            <PermissionGate resource="hr" permission="delete">
                              <button
                                onClick={() => handleRestore(r.id, fullName)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold transition-colors"
                                title="Restore record">
                                <RotateCcw size={12} /> Restore
                              </button>
                            </PermissionGate>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm">
              <span className="text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page === 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page === meta.last_page}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
