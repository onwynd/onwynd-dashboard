"use client";

// NDPR Compliance Checklist — Nigeria Data Protection Regulation 2023
//
// Covers the 7 principal obligations for health-data processors under NDPR.
// Each item maps to a specific NDPR article and records:
//   - implemented: boolean (persisted to /api/v1/compliance/ndpr via PATCH)
//   - evidence: free-text note or document reference
//   - owner: team member responsible
//   - last_reviewed: date
//
// Data contract:
//   GET  /api/v1/compliance/ndpr       → NdprItem[]
//   PATCH /api/v1/compliance/ndpr/{id} → { implemented, evidence, owner, last_reviewed }

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ComplianceSidebar } from "@/components/compliance-dashboard/sidebar";
import { DashboardHeader } from "@/components/compliance-dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import client from "@/lib/api/client";
import { Shield, CheckCircle2, AlertCircle, ClipboardList, ExternalLink } from "lucide-react";

// ── Static NDPR checklist items ───────────────────────────────────────────────
// Source: NDPR 2023 and NDPC Implementation Framework for Health Data Processors
const NDPR_ITEMS: {
  id: string;
  article: string;
  title: string;
  description: string;
  category: "lawful_basis" | "data_subject_rights" | "security" | "governance" | "transfer";
  mandatory: boolean;
}[] = [
  // LAWFUL BASIS
  {
    id: "ndpr-01",
    article: "Art. 2.2",
    title: "Lawful basis for processing health data",
    description:
      "Onwynd processes sensitive health data (session notes, mood logs, AI conversations). " +
      "Document and record the lawful basis for each data type: explicit consent, vital interests, or public interest. " +
      "Consent must be granular — separate consents for therapy data vs AI companion data vs analytics.",
    category: "lawful_basis",
    mandatory: true,
  },
  {
    id: "ndpr-02",
    article: "Art. 2.3",
    title: "Privacy notice published and current",
    description:
      "A clear privacy notice must be shown at account creation and accessible at all times. " +
      "It must state: what data is collected, why, how long it is kept, third parties it is shared with (LiveKit, Groq, OpenAI, Paystack, Firebase), " +
      "and how users exercise their rights. Review and update every 6 months or after any new integration.",
    category: "lawful_basis",
    mandatory: true,
  },
  // DATA SUBJECT RIGHTS
  {
    id: "ndpr-03",
    article: "Art. 3.1",
    title: "Right to access — patient data export",
    description:
      "Users must be able to request a copy of all data held about them within 72 hours of request. " +
      "This includes: profile, mood logs, journal entries, AI conversation history, session records, subscription history. " +
      "Build or document the data export mechanism. Log all access requests.",
    category: "data_subject_rights",
    mandatory: true,
  },
  {
    id: "ndpr-04",
    article: "Art. 3.2",
    title: "Right to erasure — account deletion with data wipe",
    description:
      "Users who delete their account must have all personal data deleted within 30 days. " +
      "Exceptions: data required for legal obligations (financial records 7 years), anonymised aggregate analytics. " +
      "Therapist session notes may be retained in anonymised form for clinical audit purposes only. " +
      "Document the retention schedule and test the deletion pipeline.",
    category: "data_subject_rights",
    mandatory: true,
  },
  {
    id: "ndpr-05",
    article: "Art. 3.3",
    title: "Right to withdraw consent",
    description:
      "Withdrawing consent must be as easy as giving it. " +
      "Provide in-app toggles for: AI companion data storage, mood/journal analytics, marketing communications. " +
      "Withdrawal must not affect access to core therapy services. " +
      "Document how consent state is propagated to all downstream processors.",
    category: "data_subject_rights",
    mandatory: true,
  },
  // SECURITY
  {
    id: "ndpr-06",
    article: "Art. 4.1",
    title: "Data encryption at rest and in transit",
    description:
      "All health data must be encrypted at rest (AES-256 or equivalent) and in transit (TLS 1.2+). " +
      "Verify: database encryption settings, S3/storage bucket encryption, session recording storage (if any), " +
      "API transport (HTTPS enforced, HSTS headers present). Run a TLS audit.",
    category: "security",
    mandatory: true,
  },
  {
    id: "ndpr-07",
    article: "Art. 4.2",
    title: "Data breach response plan",
    description:
      "A documented incident response plan must exist covering: detection, containment, assessment, " +
      "notification to NDPC within 72 hours of discovery, notification to affected users within a reasonable time. " +
      "Designate a Data Protection Officer (DPO) or appoint the compliance officer as point of contact for NDPC.",
    category: "security",
    mandatory: true,
  },
  {
    id: "ndpr-08",
    article: "Art. 4.3",
    title: "Access control and staff data training",
    description:
      "Staff who access patient data must be trained annually on NDPR obligations. " +
      "Access must be role-based and logged. Therapists access only their own patients. " +
      "Clinical advisors access anonymised flags only. Admin access is audited. " +
      "Document training completion and access reviews.",
    category: "security",
    mandatory: false,
  },
  // GOVERNANCE
  {
    id: "ndpr-09",
    article: "Art. 5.1",
    title: "Data Protection Impact Assessment (DPIA) for AI companion",
    description:
      "A DPIA is required before deploying any high-risk processing — the Doctor Onwynd AI companion " +
      "qualifies as high-risk (mental health context, automated profiling, distress detection). " +
      "Document: purpose, necessity, risks, mitigations. Review annually or after model changes.",
    category: "governance",
    mandatory: true,
  },
  {
    id: "ndpr-10",
    article: "Art. 5.2",
    title: "Data Processing Agreements with third-party processors",
    description:
      "DPAs must be in place with: Groq/OpenAI (AI inference), LiveKit (video), " +
      "Firebase (auth + FCM), Paystack/Stripe (payments). " +
      "Each DPA must bind the processor to NDPR-equivalent data protection standards. " +
      "Review and document the agreements. Note which processors are outside Nigeria (international transfer rules apply).",
    category: "governance",
    mandatory: true,
  },
  // INTERNATIONAL TRANSFER
  {
    id: "ndpr-11",
    article: "Art. 6.1",
    title: "International data transfer safeguards",
    description:
      "Patient data transferred outside Nigeria (to Groq/OpenAI US servers, Firebase US, Stripe US) " +
      "must be covered by adequacy decisions, standard contractual clauses, or explicit consent. " +
      "Document the legal mechanism for each transfer. Consider data residency options for session data.",
    category: "transfer",
    mandatory: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  lawful_basis: "Lawful Basis",
  data_subject_rights: "Data Subject Rights",
  security: "Security & Breach",
  governance: "Governance & Assessments",
  transfer: "International Transfers",
};

const CATEGORY_COLORS: Record<string, string> = {
  lawful_basis: "bg-blue-100 text-blue-700",
  data_subject_rights: "bg-purple-100 text-purple-700",
  security: "bg-red-100 text-red-700",
  governance: "bg-amber-100 text-amber-700",
  transfer: "bg-emerald-100 text-emerald-700",
};

interface NdprState {
  id: string;
  implemented: boolean;
  evidence: string;
  owner: string;
  last_reviewed: string;
}

type ApiRecord = Record<string, { implemented?: boolean; evidence?: string; owner?: string; last_reviewed?: string }>;

export default function NdprChecklistPage() {
  const [states, setStates] = useState<Record<string, NdprState>>(() =>
    Object.fromEntries(
      NDPR_ITEMS.map((item) => [
        item.id,
        { id: item.id, implemented: false, evidence: "", owner: "", last_reviewed: "" },
      ])
    )
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ evidence: string; owner: string; last_reviewed: string }>({
    evidence: "", owner: "", last_reviewed: "",
  });

  useEffect(() => {
    client
      .get("/api/v1/compliance/ndpr")
      .then((res) => {
        const data: ApiRecord = res.data?.data ?? res.data ?? {};
        if (typeof data === "object") {
          setStates((prev) => {
            const next = { ...prev };
            Object.entries(data).forEach(([id, record]) => {
              if (next[id]) {
                next[id] = {
                  ...next[id],
                  implemented: Boolean(record?.implemented),
                  evidence: record?.evidence ?? "",
                  owner: record?.owner ?? "",
                  last_reviewed: record?.last_reviewed ?? "",
                };
              }
            });
            return next;
          });
        }
      })
      .catch(() => {
        // API not yet built — work from local state only
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleImplemented = async (id: string) => {
    const current = states[id];
    const next = { ...current, implemented: !current.implemented };
    setStates((prev) => ({ ...prev, [id]: next }));
    setSaving(id);
    try {
      await client.patch(`/api/v1/compliance/ndpr/${id}`, { implemented: next.implemented });
    } catch {
      // Revert on failure
      setStates((prev) => ({ ...prev, [id]: current }));
      toast({ title: "Could not save", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const openEdit = (id: string) => {
    const s = states[id];
    setEditDraft({ evidence: s.evidence, owner: s.owner, last_reviewed: s.last_reviewed });
    setEditItem(id);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    const current = states[editItem];
    const next = { ...current, ...editDraft };
    setStates((prev) => ({ ...prev, [editItem]: next }));
    setEditItem(null);
    try {
      await client.patch(`/api/v1/compliance/ndpr/${editItem}`, editDraft);
      toast({ title: "Saved", description: "NDPR record updated." });
    } catch {
      setStates((prev) => ({ ...prev, [editItem]: current }));
      toast({ title: "Could not save", variant: "destructive" });
    }
  };

  const implemented = Object.values(states).filter((s) => s.implemented).length;
  const total = NDPR_ITEMS.length;
  const mandatoryTotal = NDPR_ITEMS.filter((i) => i.mandatory).length;
  const mandatoryDone = NDPR_ITEMS.filter((i) => i.mandatory && states[i.id]?.implemented).length;
  const score = Math.round((implemented / total) * 100);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <ComplianceSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />

          <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="size-5 text-primary" />
                  <h1 className="text-2xl font-bold">NDPR Compliance Checklist</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nigeria Data Protection Regulation 2023 — obligations for health data processors.
                  {" "}<a href="https://ndpc.gov.ng" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground">
                    NDPC website <ExternalLink className="size-3" />
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-3xl font-bold leading-none">{score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{implemented}/{total} complete</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6"
                      className="text-muted" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6"
                      strokeDasharray={`${score * 1.759} 175.9`}
                      className={score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500"} />
                  </svg>
                </div>
              </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total items", value: total, color: "text-foreground" },
                { label: "Completed", value: implemented, color: "text-emerald-600" },
                { label: "Mandatory", value: mandatoryTotal, color: "text-amber-600" },
                { label: "Mandatory done", value: mandatoryDone, color: mandatoryDone === mandatoryTotal ? "text-emerald-600" : "text-red-600" },
              ].map(({ label, value, color }) => (
                <Card key={label} className="py-3">
                  <CardContent className="px-4 py-0 flex flex-col gap-0.5">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checklist grouped by category */}
            {Object.entries(CATEGORY_LABELS).map(([cat, catLabel]) => {
              const items = NDPR_ITEMS.filter((i) => i.category === cat);
              return (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${CATEGORY_COLORS[cat]} border-0 text-xs`}>{catLabel}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {items.filter((i) => states[i.id]?.implemented).length}/{items.length} done
                    </span>
                  </div>

                  {items.map((item) => {
                    const state = states[item.id];
                    const isSaving = saving === item.id;
                    return (
                      <Card key={item.id} className={`transition-colors ${state.implemented ? "border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20" : ""}`}>
                        <CardHeader className="pb-2 pt-4 px-5">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={item.id}
                              checked={state.implemented}
                              disabled={isSaving || loading}
                              onCheckedChange={() => toggleImplemented(item.id)}
                              className="mt-0.5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Label htmlFor={item.id} className="text-sm font-semibold cursor-pointer leading-snug">
                                  {item.title}
                                </Label>
                                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                                  {item.article}
                                </Badge>
                                {item.mandatory && (
                                  <Badge className="text-[10px] bg-red-100 text-red-700 border-0 px-1.5 py-0">
                                    Mandatory
                                  </Badge>
                                )}
                                {state.implemented ? (
                                  <CheckCircle2 className="size-4 text-emerald-500 ml-auto shrink-0" />
                                ) : (
                                  <AlertCircle className="size-4 text-amber-400 ml-auto shrink-0" />
                                )}
                              </div>
                              <CardDescription className="text-xs leading-relaxed">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-4 pt-0">
                          <div className="pl-7 space-y-1">
                            {state.evidence && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Evidence:</span> {state.evidence}
                              </p>
                            )}
                            {state.owner && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Owner:</span> {state.owner}
                              </p>
                            )}
                            {state.last_reviewed && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Last reviewed:</span>{" "}
                                {new Date(state.last_reviewed).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                              </p>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs mt-1"
                              onClick={() => openEdit(item.id)}
                            >
                              <ClipboardList className="size-3 mr-1" />
                              {state.evidence || state.owner ? "Edit notes" : "Add evidence / owner"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })}
          </main>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update NDPR Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="evidence" className="text-sm font-medium">Evidence / notes</Label>
              <Textarea
                id="evidence"
                placeholder="e.g. Privacy policy published at onwynd.com/privacy — last updated 2026-01-15"
                value={editDraft.evidence}
                onChange={(e) => setEditDraft((p) => ({ ...p, evidence: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner" className="text-sm font-medium">Responsible owner</Label>
              <Input
                id="owner"
                placeholder="e.g. Legal Advisor / Compliance Officer"
                value={editDraft.owner}
                onChange={(e) => setEditDraft((p) => ({ ...p, owner: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_reviewed" className="text-sm font-medium">Last reviewed date</Label>
              <Input
                id="last_reviewed"
                type="date"
                value={editDraft.last_reviewed}
                onChange={(e) => setEditDraft((p) => ({ ...p, last_reviewed: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
