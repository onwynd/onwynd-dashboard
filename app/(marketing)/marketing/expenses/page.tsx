"use client";

import { useEffect, useRef, useState } from "react";
import { PlusCircle, Upload, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import client from "@/lib/api/client";
import { PermissionGate } from "@/components/shared/PermissionGate";

interface Expense {
  id: number;
  platform: string;
  description: string;
  amount_planned: number;
  amount_spent: number;
  balance_remaining: number;
  is_overspend: boolean;
  overspend_amount: number;
  currency: string;
  spend_date: string;
  proof_file_name?: string;
  proof_url?: string;
  social_proof_url?: string;
  status: "pending" | "approved" | "rejected";
  review_notes?: string;
  submittedBy?: { id: number; first_name: string; last_name: string };
}

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const PLATFORMS = ["Facebook", "Instagram", "Twitter/X", "Google Ads", "LinkedIn", "TikTok", "YouTube", "WhatsApp", "Other"];

export default function CampaignExpensesPage() {
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    platform: PLATFORMS[0],
    description: "",
    amount_planned: "",
    amount_spent: "",
    spend_date: new Date().toISOString().split("T")[0],
    social_proof_url: "",
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await client.get("/api/v1/campaign-expenses");
      setExpenses(res.data?.data ?? res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!form.description || !form.amount_planned || !form.amount_spent) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("platform",        form.platform);
      fd.append("description",     form.description);
      fd.append("amount_planned",  form.amount_planned);
      fd.append("amount_spent",    form.amount_spent);
      fd.append("spend_date",      form.spend_date);
      if (form.social_proof_url) fd.append("social_proof_url", form.social_proof_url);
      if (fileRef.current?.files?.[0]) fd.append("proof_file", fileRef.current.files[0]);

      await client.post("/api/v1/campaign-expenses", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchExpenses();
      setShowForm(false);
      setForm({ platform: PLATFORMS[0], description: "", amount_planned: "", amount_spent: "", spend_date: new Date().toISOString().split("T")[0], social_proof_url: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaign Expenses</h1>
          <p className="text-sm text-muted-foreground">Upload proof of payment for ad spend and campaign costs.</p>
        </div>

        <PermissionGate resource="campaign_expense" permission="write">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={16} /> Log Expense
          </button>
        </PermissionGate>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">New Expense Entry</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Platform <span className="text-red-500">*</span></label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Spend Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.spend_date}
                onChange={(e) => setForm({ ...form, spend_date: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Planned Amount (NGN) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.amount_planned}
                onChange={(e) => setForm({ ...form, amount_planned: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Actual Amount Spent (NGN) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.amount_spent}
                onChange={(e) => setForm({ ...form, amount_spent: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
              {form.amount_planned && form.amount_spent && Number(form.amount_spent) > Number(form.amount_planned) && (
                <p className="text-xs text-red-500 mt-1">
                  Overspend: ₦{(Number(form.amount_spent) - Number(form.amount_planned)).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What was this spend for?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Social Media Proof URL (optional)</label>
            <input
              type="url"
              value={form.social_proof_url}
              onChange={(e) => setForm({ ...form, social_proof_url: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              placeholder="https://www.instagram.com/p/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Proof of Payment (screenshot / PDF)</label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {fileRef.current?.files?.[0]?.name ?? "Click to upload screenshot or PDF (max 10 MB)"}
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={() => setForm({ ...form })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              disabled={submitting || !form.description || !form.amount_planned || !form.amount_spent}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Uploading…" : "Submit Expense"}
            </button>
          </div>
        </div>
      )}

      {/* Expense list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No expenses logged yet.</div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-4 bg-card hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{exp.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[exp.status]}`}>
                      {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                    </span>
                    {exp.is_overspend && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        Overspend ₦{Number(exp.overspend_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{exp.description}</p>
                  <div className="text-xs space-x-3">
                    <span>Planned: <span className="font-medium">₦{Number(exp.amount_planned).toLocaleString()}</span></span>
                    <span>Spent: <span className={`font-medium ${exp.is_overspend ? "text-red-600" : "text-foreground"}`}>₦{Number(exp.amount_spent).toLocaleString()}</span></span>
                    <span>{exp.spend_date}</span>
                  </div>
                  {exp.review_notes && (
                    <p className="text-xs mt-1 text-muted-foreground italic">{exp.review_notes}</p>
                  )}
                </div>

                <div className="flex gap-2 items-center shrink-0">
                  {exp.proof_url && (
                    <a href={exp.proof_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {exp.social_proof_url && (
                    <a href={exp.social_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      View post
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
