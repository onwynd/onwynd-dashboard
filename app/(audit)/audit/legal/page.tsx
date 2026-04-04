"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface LegalDoc {
  id: number;
  title: string;
  category: "policy" | "agreement" | "regulation" | "notice";
  status: "current" | "pending_review" | "expired";
  version: string;
  last_updated: string;
  owner: string;
  description: string;
}

const DOCS: LegalDoc[] = [
  {
    id: 1,
    title: "Privacy Policy",
    category: "policy",
    status: "current",
    version: "v3.1",
    last_updated: "2025-01-15",
    owner: "Legal / DPO",
    description: "NDPR-compliant privacy policy covering all data collection and processing activities on onwynd.com and the mobile app.",
  },
  {
    id: 2,
    title: "Terms of Service",
    category: "agreement",
    status: "current",
    version: "v2.4",
    last_updated: "2025-01-15",
    owner: "Legal",
    description: "Platform terms binding patients, therapists, and partner organisations.",
  },
  {
    id: 3,
    title: "Therapist Service Agreement",
    category: "agreement",
    status: "current",
    version: "v1.8",
    last_updated: "2025-02-01",
    owner: "Legal / HR",
    description: "Independent contractor agreement for all therapists operating on the platform.",
  },
  {
    id: 4,
    title: "Data Processing Agreement (DPA)",
    category: "agreement",
    status: "current",
    version: "v1.2",
    last_updated: "2025-01-20",
    owner: "DPO",
    description: "DPA governing how Onwynd processes personal data on behalf of partner organisations (HMOs, corporates).",
  },
  {
    id: 5,
    title: "NDPR Compliance Framework",
    category: "regulation",
    status: "current",
    version: "2023 edition",
    last_updated: "2025-03-01",
    owner: "Compliance Officer",
    description: "Internal framework mapping NITDA's NDPR 2023 requirements to platform controls.",
  },
  {
    id: 6,
    title: "Cookie & Tracking Notice",
    category: "notice",
    status: "pending_review",
    version: "v1.0",
    last_updated: "2024-11-10",
    owner: "Legal / Tech",
    description: "Disclosure of analytics cookies and third-party tracking scripts. Due for update following SDK changes.",
  },
  {
    id: 7,
    title: "Vulnerable Adult & Minors Policy",
    category: "policy",
    status: "pending_review",
    version: "v1.1",
    last_updated: "2024-09-05",
    owner: "Clinical / Legal",
    description: "Policy governing interactions with minors and at-risk individuals. Annual review due.",
  },
];

const CATEGORY_BADGE: Record<string, string> = {
  policy:     "bg-blue-50 text-blue-700",
  agreement:  "bg-purple-50 text-purple-700",
  regulation: "bg-slate-100 text-slate-700",
  notice:     "bg-amber-50 text-amber-700",
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; badge: string; label: string }> = {
  current:        { icon: CheckCircle2,  color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700", label: "Current" },
  pending_review: { icon: Clock,         color: "text-yellow-600",  badge: "bg-yellow-50 text-yellow-700",   label: "Pending Review" },
  expired:        { icon: AlertTriangle, color: "text-red-600",     badge: "bg-red-50 text-red-700",         label: "Expired" },
};

export default function LegalDocsPage() {
  const [filter, setFilter] = useState<"all" | LegalDoc["status"]>("all");

  const visible = filter === "all" ? DOCS : DOCS.filter((d) => d.status === filter);
  const pendingCount = DOCS.filter((d) => d.status === "pending_review").length;
  const expiredCount = DOCS.filter((d) => d.status === "expired").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Legal Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform policies, agreements, and regulatory documents</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Download className="size-4" /> Export All
        </Button>
      </div>

      {/* Alert for pending/expired */}
      {(pendingCount > 0 || expiredCount > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
          <AlertTriangle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800">
            {pendingCount > 0 && <>{pendingCount} document{pendingCount > 1 ? "s" : ""} pending review. </>}
            {expiredCount > 0 && <>{expiredCount} document{expiredCount > 1 ? "s are" : " is"} expired.</>}
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "current", "pending_review", "expired"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Docs list */}
      <div className="space-y-3">
        {visible.map((doc) => {
          const sc = STATUS_CONFIG[doc.status];
          return (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">{doc.title}</p>
                      <Badge className={`text-xs capitalize ${CATEGORY_BADGE[doc.category]}`}>{doc.category}</Badge>
                      <Badge className={`text-xs ${sc.badge}`}>{sc.label}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Owner: {doc.owner}</span>
                      <span>Updated: {doc.last_updated}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" disabled>
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
