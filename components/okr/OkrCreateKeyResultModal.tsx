"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X, Zap } from "lucide-react";
import { okrService } from "@/lib/api/okr";
import type {
  BindableMetrics,
  CreateKeyResultInput,
  OkrKeyResult,
  OkrOwner,
} from "@/types/okr";

interface OkrCreateKeyResultModalProps {
  objectiveId: number;
  onClose: () => void;
  onCreated: (kr: OkrKeyResult) => void;
}

export function OkrCreateKeyResultModal({
  objectiveId,
  onClose,
  onCreated,
}: OkrCreateKeyResultModalProps) {
  const [members, setMembers] = useState<OkrOwner[]>([]);
  const [metrics, setMetrics] = useState<BindableMetrics>({});
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [form, setForm] = useState<CreateKeyResultInput>({
    objective_id: objectiveId,
    title: "",
    metric_type: "manual",
    unit: "count",
    start_value: 0,
    target_value: 0,
    due_date: "",
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
    okrService
      .getBindableMetrics()
      .then((r) => {
        if (r) setMetrics(r);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.due_date) {
      setError("Due date is required.");
      return;
    }
    if (form.target_value === 0) {
      setError("Target value must be non-zero.");
      return;
    }
    if (form.metric_type === "auto" && !form.metric_key) {
      setError("Select a metric to auto-bind.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await okrService.createKeyResult(form);
      if (res) onCreated(res);
    } catch {
      setError("Failed to create key result. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,22,15,0.12)] bg-[rgba(31,22,15,0.02)] text-[#1f160f] text-sm focus:outline-none focus:ring-2 focus:ring-[#9bb068]/40 focus:border-[#9bb068] transition";
  const allMetricKeys = Object.entries(metrics).flatMap(([group, keys]) =>
    Object.entries(keys).map(([key, label]) => ({ group, key, label })),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1f160f]">Add Key Result</h2>
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
              placeholder="e.g. Reach 10,000 MAU"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-2">
              Tracking type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["manual", "auto"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      metric_type: type,
                      metric_key: undefined,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    form.metric_type === type
                      ? "bg-[#4b3425] border-[#4b3425] text-white"
                      : "border-[rgba(31,22,15,0.12)] text-[rgba(31,22,15,0.6)] hover:bg-[rgba(31,22,15,0.04)]"
                  }`}
                >
                  {type === "auto" && <Zap className="w-3 h-3" />}
                  {type === "manual" ? "Manual check-in" : "Auto (live metric)"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[rgba(31,22,15,0.4)] mt-1.5">
              {form.metric_type === "auto"
                ? "Automatically pulls nightly from your live dashboard metrics."
                : "You or your team update progress manually via check-ins."}
            </p>
          </div>

          {form.metric_type === "auto" && (
            <div className="relative">
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Bind to metric <span className="text-[#fe814b]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setMetricsOpen((o) => !o)}
                className={`${inputClass} flex items-center justify-between text-left`}
              >
                <span
                  className={
                    form.metric_key
                      ? "text-[#1f160f]"
                      : "text-[rgba(31,22,15,0.35)]"
                  }
                >
                  {form.metric_key
                    ? (allMetricKeys.find((m) => m.key === form.metric_key)
                        ?.label ?? form.metric_key)
                    : "Select a metric..."}
                </span>
                <ChevronDown className="w-4 h-4 text-[rgba(31,22,15,0.4)]" />
              </button>
              {metricsOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[rgba(31,22,15,0.12)] rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {Object.entries(metrics).map(([group, keys]) => (
                    <div key={group}>
                      <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] uppercase tracking-widest px-3 pt-2.5 pb-1">
                        {group}
                      </p>
                      {Object.entries(keys).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, metric_key: key }));
                            setMetricsOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-[#1f160f] hover:bg-[rgba(31,22,15,0.04)] transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Start
              </label>
              <input
                type="number"
                value={form.start_value}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    start_value: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Target *
              </label>
              <input
                type="number"
                required
                value={form.target_value || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    target_value: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Unit
              </label>
              <input
                type="text"
                maxLength={20}
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                placeholder="count"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(31,22,15,0.6)] mb-1.5">
                Due date *
              </label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
                className={inputClass}
              />
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
                    {m.first_name} {m.last_name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
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
              {submitting ? "Creating..." : "Add Key Result"}
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
