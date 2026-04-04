"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import client from "@/lib/api/client";

interface Viewer {
  user: { id: number; first_name: string; last_name: string; email: string };
  viewed_at: string;
  ip: string;
}

const SENSITIVE_PAGES = [
  { key: "finance.statements",    label: "Finance Statements" },
  { key: "finance.payroll",       label: "Payroll / Salary Data" },
  { key: "cfo.dashboard",         label: "CFO Dashboard" },
  { key: "audit.logs",            label: "Audit Logs" },
  { key: "hr.payroll",            label: "HR Payroll" },
  { key: "hr.contracts",          label: "HR Contracts" },
  { key: "admin.users",           label: "User Management" },
  { key: "admin.permissions",     label: "Permissions" },
  { key: "president.dashboard",   label: "President Dashboard" },
];

export default function PageViewsAuditPage() {
  const [selectedPage, setSelectedPage] = useState(SENSITIVE_PAGES[0].key);
  const [viewers, setViewers]           = useState<Viewer[]>([]);
  const [total, setTotal]               = useState(0);
  const [isLoading, setIsLoading]       = useState(false);
  const [queried, setQueried]           = useState(false);

  const fetchViewers = async () => {
    setIsLoading(true);
    setQueried(true);
    try {
      const res = await client.get("/api/v1/page-views", { params: { page_key: selectedPage, limit: 100 } });
      setViewers(res.data.viewers ?? []);
      setTotal(res.data.total ?? 0);
    } finally {
      setIsLoading(false);
    }
  };

  const pageLabel = SENSITIVE_PAGES.find((p) => p.key === selectedPage)?.label ?? selectedPage;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Page View Audit Trail</h1>
        <p className="text-sm text-muted-foreground">See who accessed sensitive pages and when.</p>
      </div>

      {/* Query form */}
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold mb-1">Sensitive Page</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          >
            {SENSITIVE_PAGES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchViewers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Search size={15} /> Query
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : queried && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold">{pageLabel}</span>
            <span className="text-xs text-muted-foreground">— {total} view{total !== 1 ? "s" : ""}</span>
          </div>

          {viewers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No views recorded for this page.</div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border overflow-hidden">
              {viewers.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card">
                  <div>
                    <p className="text-sm font-medium">
                      {v.user.first_name} {v.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(v.viewed_at).toLocaleString()}
                    </p>
                    {v.ip && <p className="text-xs text-muted-foreground font-mono">{v.ip}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
