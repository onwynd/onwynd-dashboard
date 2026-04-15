"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { okrService } from "@/lib/api/okr";
import type { CreateObjectiveInput, OkrObjective, OkrOwner } from "@/types/okr";

interface OkrCreateObjectiveModalProps {
  onClose: () => void;
  onCreated: (obj: OkrObjective) => void;
  quarter: string;
}

const QUARTERS = () => {
  const out: string[] = [];
  const year = new Date().getFullYear();
  for (let y = year; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q += 1) out.push(`Q${q}-${y}`);
  }
  return out;
};

const DEPARTMENTS = [
  "growth",
  "product",
  "sales",
  "marketing",
  "finance",
  "hr",
  "support",
  "clinical",
  "tech",
  "compliance",
  "legal",
];

export function OkrCreateObjectiveModal({
  onClose,
  onCreated,
  quarter,
}: OkrCreateObjectiveModalProps) {
  const [members, setMembers] = useState<OkrOwner[]>([]);
  const [form, setForm] = useState<CreateObjectiveInput>({
    title: "",
    description: "",
    quarter,
    department: "",
    owner_id: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    okrService
      .getTeamMembers()
      .then((r) => {
        if (r) setMembers(r);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await okrService.createObjective(form);
      if (res) onCreated(res);
    } catch {
      setError("Failed to create objective. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,22,15,0.12)] bg-[rgba(31,22,15,0.02)] text-[#1f160f] text-sm focus:outline-none focus:ring-2 focus:ring-[#9bb068]/40 focus:border-[#9bb068] transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1f160f]">
            Create Objective
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[rgba(31,22,15,0.05)] transition-colors"
          >
            <X className="w-4 h-4 text-[rgba(31,22,15,0.5)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Grow our active user base to 10,000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              maxLength={2000}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What does success look like?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Quarter *
              </label>
              <select
                value={form.quarter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quarter: e.target.value }))
                }
                className={inputClass}
              >
                {QUARTERS().map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">All / Company</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
              Owner
            </label>
            <select
              value={form.owner_id ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  owner_id: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
                }))
              }
              className={inputClass}
            >
              <option value="">Me (default)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.role_name ?? m.role})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-[#fe814b] font-medium">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-[#4b3425] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {submitting ? "Creating..." : "Create Objective"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-[rgba(31,22,15,0.12)] text-[rgba(31,22,15,0.6)] hover:bg-[rgba(31,22,15,0.04)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
