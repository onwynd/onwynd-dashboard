"use client";

import { useEffect, useState } from "react";
import { Users, ChevronRight, ChevronDown } from "lucide-react";
import client from "@/lib/api/client";
import { usePageView } from "@/hooks/usePageView";

// ── Types matching the API response ────────────────────────────────────────────

interface OrgNodeUser {
  id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string | null;
}

interface OrgNode {
  id: number;
  user: OrgNodeUser;
  designation?: { title: string; level: number } | null;
  department?: { name: string } | null;
  reports: OrgNode[];
}

// ── Org card (recursive) ───────────────────────────────────────────────────────

function OrgCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasReports = node.reports && node.reports.length > 0;
  const initials = `${node.user.first_name[0] ?? ""}${node.user.last_name[0] ?? ""}`.toUpperCase();
  const fullName = `${node.user.first_name} ${node.user.last_name}`;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-border" : ""}>
      <div className="flex items-start gap-3 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          disabled={!hasReports}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {hasReports ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-2 h-2 rounded-full bg-muted inline-block" />
          )}
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-muted/30 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{fullName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {node.designation?.title ?? "—"}
              {node.department && ` · ${node.department.name}`}
            </div>
          </div>
          {hasReports && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {node.reports.length} report{node.reports.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {expanded && hasReports && (
        <div>
          {node.reports.map((child) => (
            <OrgCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Flatten tree for search ────────────────────────────────────────────────────

function flattenTree(nodes: OrgNode[]): OrgNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.reports)]);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrgChartPage() {
  usePageView("hr.org_chart");

  const [roots, setRoots]         = useState<OrgNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    setIsLoading(true);
    client
      .get("/api/v1/hr/org-chart")
      .then((res) => setRoots(res.data ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  const allNodes  = flattenTree(roots);
  const totalCount = allNodes.length;

  const searchResults = search.trim()
    ? allNodes.filter((n) => {
        const q = search.toLowerCase();
        return (
          n.user.first_name.toLowerCase().includes(q) ||
          n.user.last_name.toLowerCase().includes(q) ||
          n.designation?.title?.toLowerCase().includes(q) ||
          n.department?.name?.toLowerCase().includes(q)
        );
      })
    : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Org Chart</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} employee{totalCount !== 1 ? "s" : ""} across the organisation.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role…"
          className="w-56 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : roots.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          <Users size={36} className="mx-auto mb-3 text-muted-foreground/40" />
          No employee records found. Add employees to build the org chart.
        </div>
      ) : searchResults ? (
        /* Search results — flat list */
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No employees match &ldquo;{search}&rdquo;.
            </div>
          ) : searchResults.map((n) => (
            <div key={n.id} className="flex items-center gap-3 p-4 bg-card hover:bg-muted/20">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                {`${n.user.first_name[0] ?? ""}${n.user.last_name[0] ?? ""}`.toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-sm">{n.user.first_name} {n.user.last_name}</span>
                <p className="text-xs text-muted-foreground">
                  {n.designation?.title ?? "—"}
                  {n.department && ` · ${n.department.name}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tree view */
        <div className="rounded-2xl border border-border bg-card p-4">
          {roots.map((root) => (
            <OrgCard key={root.id} node={root} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}
