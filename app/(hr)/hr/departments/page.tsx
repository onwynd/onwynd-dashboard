"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Building2, Users, Pencil, Trash2, UserCheck } from "lucide-react";
import client from "@/lib/api/client";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { usePageView } from "@/hooks/usePageView";

interface StaffUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headcount?: number;
  employees_count?: number;
  is_active: boolean;
  head?: { id: number; first_name: string; last_name: string } | null;
  parent?: { id: number; name: string; code: string } | null;
  children?: Department[];
}

const EMPTY_FORM = {
  name: "", code: "", description: "", head_user_id: "", parent_department_id: "",
};

export default function DepartmentsPage() {
  usePageView("hr.departments");

  const [depts, setDepts]         = useState<Department[]>([]);
  const [staff, setStaff]         = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Department | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const loadDepts = async () => {
    setIsLoading(true);
    try {
      const res = await client.get("/api/v1/hr/departments");
      setDepts(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      // Pull active employees to use as department head candidates
      const res = await client.get("/api/v1/hr/employee-records", {
        params: { employment_status: "active", per_page: 200 },
      });
      const items = res.data?.data ?? res.data ?? [];
      setStaff(
        (Array.isArray(items) ? items : []).map(
          (e: { user: { id: number; first_name: string; last_name: string; email: string } }) => ({
            id: e.user.id,
            first_name: e.user.first_name,
            last_name: e.user.last_name,
            email: e.user.email,
          })
        )
      );
    } catch {
      // Non-blocking — head selector degrades gracefully
    }
  };

  useEffect(() => {
    loadDepts();
    loadStaff();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({
      name: d.name,
      code: d.code,
      description: d.description ?? "",
      head_user_id: d.head?.id?.toString() ?? "",
      parent_department_id: d.parent?.id?.toString() ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description || undefined,
        head_user_id: form.head_user_id ? parseInt(form.head_user_id) : null,
        parent_department_id: form.parent_department_id
          ? parseInt(form.parent_department_id) : null,
      };
      if (editing) {
        await client.put(`/api/v1/hr/departments/${editing.id}`, payload);
      } else {
        await client.post("/api/v1/hr/departments", payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      await loadDepts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this department? It must have no employees.")) return;
    await client.delete(`/api/v1/hr/departments/${id}`);
    await loadDepts();
  };

  const parentOptions = depts.filter((d) => !editing || d.id !== editing.id);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage organizational departments and their structure.
          </p>
        </div>
        <PermissionGate resource="hr" permission="write">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={16} /> New Department
          </button>
        </PermissionGate>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">
            {editing ? "Edit Department" : "New Department"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Marketing"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="MKT"
                maxLength={20}
              />
            </div>

            {/* Department Head */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Department Head
              </label>
              <select
                value={form.head_user_id}
                onChange={(e) => setForm({ ...form, head_user_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">— None —</option>
                {staff.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                    {u.email ? ` (${u.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Department */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Parent Department
              </label>
              <select
                value={form.parent_department_id}
                onChange={(e) => setForm({ ...form, parent_department_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">— None (top-level) —</option>
                {parentOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Description — full width */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={saving || !form.name || !form.code}
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Department list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : depts.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No departments yet. Create one to get started.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {depts.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-4 p-4 bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{dept.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {dept.code}
                  </span>
                  {dept.parent && (
                    <span className="text-[10px] text-muted-foreground">
                      under {dept.parent.name}
                    </span>
                  )}
                  {!dept.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {dept.employees_count ?? dept.headcount ?? 0} employees
                  </span>
                  {dept.head && (
                    <span className="flex items-center gap-1">
                      <UserCheck size={11} />
                      Head: {dept.head.first_name} {dept.head.last_name}
                    </span>
                  )}
                  {dept.description && <span>{dept.description}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <PermissionGate resource="hr" permission="update">
                  <button
                    onClick={() => openEdit(dept)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                </PermissionGate>
                <PermissionGate resource="hr" permission="delete">
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
