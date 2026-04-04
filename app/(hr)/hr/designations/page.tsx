"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Briefcase, ChevronUp, Pencil, Trash2 } from "lucide-react";
import client from "@/lib/api/client";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { usePageView } from "@/hooks/usePageView";

interface Department { id: number; name: string; code: string; }
interface Designation {
  id: number;
  title: string;
  code: string;
  level: number;
  department?: Department | null;
  reports_to?: { id: number; title: string } | null;
  salary_band_min?: number | null;
  salary_band_max?: number | null;
  is_active: boolean;
  employees_count?: number;
  employee_count?: number; // legacy alias
}

const LEVEL_LABELS: Record<number, string> = {
  1: "C-Suite / Executive",
  2: "President / EVP",
  3: "VP / Director",
  4: "Senior Manager",
  5: "Manager",
  6: "Senior Associate",
  7: "Associate",
  8: "Junior",
  9: "Entry Level",
  10: "Intern",
};

const EMPTY_FORM = {
  title: "", code: "", level: "5", department_id: "",
  reports_to_designation_id: "", salary_band_min: "", salary_band_max: "",
};

const fmt = (n?: number | null) =>
  n != null ? `₦${n.toLocaleString()}` : "—";

export default function DesignationsPage() {
  usePageView("hr.designations");

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<Designation | null>(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [dRes, depRes] = await Promise.all([
        client.get("/api/v1/hr/designations"),
        client.get("/api/v1/hr/departments"),
      ]);
      setDesignations(dRes.data ?? []);
      setDepartments(depRes.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (d: Designation) => {
    setEditing(d);
    setForm({
      title: d.title,
      code: d.code,
      level: d.level.toString(),
      department_id: d.department?.id?.toString() ?? "",
      reports_to_designation_id: d.reports_to?.id?.toString() ?? "",
      salary_band_min: d.salary_band_min?.toString() ?? "",
      salary_band_max: d.salary_band_max?.toString() ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.code || !form.level) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        code: form.code.toUpperCase(),
        level: parseInt(form.level),
        department_id: form.department_id ? parseInt(form.department_id) : null,
        reports_to_designation_id: form.reports_to_designation_id
          ? parseInt(form.reports_to_designation_id) : null,
        salary_band_min: form.salary_band_min ? parseFloat(form.salary_band_min) : null,
        salary_band_max: form.salary_band_max ? parseFloat(form.salary_band_max) : null,
      };
      if (editing) {
        await client.put(`/api/v1/hr/designations/${editing.id}`, payload);
      } else {
        await client.post("/api/v1/hr/designations", payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this designation? It must have no assigned employees.")) return;
    await client.delete(`/api/v1/hr/designations/${id}`);
    await load();
  };

  // Group by level for display
  const byLevel = designations.reduce<Record<number, Designation[]>>((acc, d) => {
    (acc[d.level] ??= []).push(d);
    return acc;
  }, {});
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

  const reportsToOptions = designations.filter(
    (d) => !editing || d.id !== editing.id
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Designations</h1>
          <p className="text-sm text-muted-foreground">
            Job titles, levels, and salary bands across departments.
          </p>
        </div>
        <PermissionGate resource="hr" permission="write">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={16} /> New Designation
          </button>
        </PermissionGate>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">
            {editing ? "Edit Designation" : "New Designation"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="SSE"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>{l} — {LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">— All Departments —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Reports To</label>
              <select
                value={form.reports_to_designation_id}
                onChange={(e) => setForm({ ...form, reports_to_designation_id: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">— None —</option>
                {reportsToOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    L{d.level} · {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Min Salary (₦)</label>
                <input
                  type="number"
                  value={form.salary_band_min}
                  onChange={(e) => setForm({ ...form, salary_band_min: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                  placeholder="0"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Max Salary (₦)</label>
                <input
                  type="number"
                  value={form.salary_band_max}
                  onChange={(e) => setForm({ ...form, salary_band_max: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                  placeholder="0"
                  min={0}
                />
              </div>
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
              disabled={saving || !form.title || !form.code}
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Designation list grouped by level */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : designations.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No designations yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level}>
              <div className="flex items-center gap-2 mb-2">
                <ChevronUp size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Level {level} — {LEVEL_LABELS[level]}
                </span>
              </div>
              <div className="divide-y divide-border rounded-2xl border overflow-hidden">
                {byLevel[level].map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-4 bg-card hover:bg-muted/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{d.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {d.code}
                        </span>
                        {d.department && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            {d.department.name}
                          </span>
                        )}
                        {!d.is_active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {d.reports_to && (
                          <span>Reports to: {d.reports_to.title}</span>
                        )}
                        <span>
                          Band: {fmt(d.salary_band_min)} – {fmt(d.salary_band_max)}
                        </span>
                        {(d.employees_count ?? d.employee_count) != null && (
                          <span>{d.employees_count ?? d.employee_count} employee{(d.employees_count ?? d.employee_count) !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <PermissionGate resource="hr" permission="update">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                      </PermissionGate>
                      <PermissionGate resource="hr" permission="delete">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
