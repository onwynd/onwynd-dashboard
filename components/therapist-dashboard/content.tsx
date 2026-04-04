"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { FinancialFlowChart } from "./financial-flow-chart";
import { PatientsTable } from "./patients-table";
import { useTherapistStore } from "@/store/therapist-store";
import { therapistService } from "@/lib/api/therapist";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Clock, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type VerificationStatus = "pending" | "approved" | "rejected" | null;

export function DashboardContent() {
  const router = useRouter();
  const showAlertBanner = useTherapistStore((state) => state.showAlertBanner);
  const showStatsCards = useTherapistStore((state) => state.showStatsCards);
  const showChart = useTherapistStore((state) => state.showChart);
  const showTable = useTherapistStore((state) => state.showTable);
  const layoutDensity = useTherapistStore((state) => state.layoutDensity);
  const fetchStats = useTherapistStore((state) => state.fetchStats);
  const fetchFinancialFlow = useTherapistStore((state) => state.fetchFinancialFlow);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [termsAckOpen, setTermsAckOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const steps = useMemo(
    () => [
      {
        id: "profile",
        title: "Complete your profile",
        description: "Add your specialty, bio, and contact details so patients can find you.",
        actionLabel: "Go to Settings",
        href: "/therapist/settings",
      },
      {
        id: "availability",
        title: "Set your availability",
        description: "Open time slots so patients can book sessions.",
        actionLabel: "Open Calendar",
        href: "/therapist/appointments",
      },
      {
        id: "patients",
        title: "Review your patient list",
        description: "See who you will be supporting and prepare for upcoming sessions.",
        actionLabel: "View Patients",
        href: "/therapist/patients",
      },
      {
        id: "sessions",
        title: "Prepare for your first session",
        description: "Review session workflows and notes to be ready from day one.",
        actionLabel: "View Sessions",
        href: "/therapist/sessions",
      },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const init = () => {
      if (cancelled) return;
      const completedRaw = localStorage.getItem("therapist_onboarding_steps");
      const completed = completedRaw ? (JSON.parse(completedRaw) as unknown) : [];
      const completedArray = Array.isArray(completed) ? completed.map((x) => String(x)) : [];
      const completedFlag = localStorage.getItem("therapist_onboarding_completed") === "true";
      const dismissedRaw = localStorage.getItem("therapist_onboarding_dismissed_until");
      const dismissed = dismissedRaw ? Number(dismissedRaw) : null;
      setCompletedSteps(completedArray);
      setOnboardingComplete(completedFlag);
      setDismissedUntil(Number.isFinite(dismissed) ? dismissed : null);
      setCurrentTime(Date.now());
      setReady(true);
    };
    const timer = setTimeout(init, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("therapist_onboarding_steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("therapist_onboarding_completed", onboardingComplete ? "true" : "false");
  }, [onboardingComplete]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dismissedUntil) {
      localStorage.setItem("therapist_onboarding_dismissed_until", String(dismissedUntil));
    } else {
      localStorage.removeItem("therapist_onboarding_dismissed_until");
    }
  }, [dismissedUntil]);

  useEffect(() => {
    fetchStats();
    fetchFinancialFlow("year");
    // Fetch verification status for the dashboard banner
    therapistService.getProfile().then((p) => {
      const profile = p as any;
      const v = profile?.verification;
      if (v) {
        setVerificationStatus(v.status ?? null);
        setRejectionReason(v.rejection_reason ?? null);
      }
      if (!profile?.terms_accepted_at) {
        setTermsAckOpen(true);
      }
    }).catch(() => null);
  }, [fetchStats, fetchFinancialFlow]);

  // ── Heartbeat: keep therapist marked online while dashboard is open ──────────
  // Calls POST /api/v1/me/heartbeat every 90 seconds.
  // The scheduler command users:mark-offline runs every 5 min and flips
  // is_online=false for anyone whose last_seen_at is older than 30 minutes.
  // On tab close/unload, sends a synchronous beacon so the therapist goes
  // offline immediately rather than waiting up to 30 min.
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    const ping = () => {
      fetch(`${apiBase}/api/v1/me/heartbeat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null); // silent — never block UI on a failed heartbeat
    };

    ping(); // immediate ping on mount
    const intervalId = setInterval(ping, 90_000); // every 90 seconds

    // On unload: sendBeacon is fire-and-forget and survives tab close —
    // marks the therapist offline immediately rather than waiting 30 min.
    const handleUnload = () => navigator.sendBeacon(`${apiBase}/api/v1/me/heartbeat`);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const activeOnboarding =
    ready &&
    !onboardingComplete &&
    (!dismissedUntil || (currentTime ?? 0) > dismissedUntil);
  const completedCount = completedSteps.length;
  const totalSteps = steps.length;
  const allDone = completedCount >= totalSteps;

  const toggleStep = (id: string, value: boolean) => {
    setCompletedSteps((prev) => {
      if (value) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((s) => s !== id);
    });
  };

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      <Dialog open={termsAckOpen} onOpenChange={setTermsAckOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Therapist Terms Acknowledgment</DialogTitle>
            <DialogDescription>
              Please review and acknowledge the Therapist Pricing, Commission & Earnings terms. You can read the full document and return to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline"
              href={(process.env.NEXT_PUBLIC_WEB_URL || "https://www.onwynd.com") + "/therapist-terms"}
              target="_blank"
              rel="noreferrer"
            >
              Open Terms in a new tab
            </a>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox id="hasRead" checked={hasRead} onCheckedChange={(val) => setHasRead(Boolean(val))} />
              <label htmlFor="hasRead" className="text-sm text-muted-foreground">
                I have read and agree to the Therapist Terms
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!hasRead || accepting}
              onClick={async () => {
                setAccepting(true);
                try {
                  await therapistService.acceptTerms();
                  setTermsAckOpen(false);
                } catch {
                  // ignore
                } finally {
                  setAccepting(false);
                }
              }}
            >
              {accepting ? "Saving..." : "Acknowledge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Verification Status Banner */}
      {verificationStatus === "rejected" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
          <ShieldAlert className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-red-900 dark:text-red-200 text-sm">Your documents have been rejected</p>
            {rejectionReason && (
              <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
            )}
          </div>
          <Button asChild size="sm" variant="destructive" className="shrink-0">
            <Link href="/therapist/profile">Re-upload Documents</Link>
          </Button>
        </div>
      )}
      {verificationStatus === "pending" && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4">
          <Clock className="size-5 text-yellow-600 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 dark:text-yellow-200 text-sm">Verification under review</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Your documents are being reviewed. This usually takes 1–3 business days.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-yellow-400 text-yellow-800">
            <Link href="/therapist/profile">View Status</Link>
          </Button>
        </div>
      )}
      {verificationStatus === "approved" && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
          <ShieldCheck className="size-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-900 dark:text-green-200">Your profile is verified ✓</p>
        </div>
      )}

      {activeOnboarding && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Welcome to your therapist dashboard</CardTitle>
                <CardDescription>
                  Complete these steps to get ready for your first clients.
                </CardDescription>
              </div>
              <Badge variant={allDone ? "default" : "secondary"}>
                {completedCount}/{totalSteps} complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => {
              const done = completedSteps.includes(step.id);
              return (
                <div key={step.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={done}
                      onCheckedChange={(v) => toggleStep(step.id, Boolean(v))}
                      aria-label={`Mark ${step.title} complete`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {index + 1}. {step.title}
                        </span>
                        {done && <Badge variant="outline">Done</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" onClick={() => router.push(step.href)}>
                          {step.actionLabel}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleStep(step.id, !done)}
                        >
                          {done ? "Mark Incomplete" : "Mark Done"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && <Separator />}
                </div>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  const now = Date.now();
                  setCurrentTime(now);
                  setDismissedUntil(now + 24 * 60 * 60 * 1000);
                }}
              >
                Skip for now
              </Button>
              <Button
                disabled={!allDone}
                onClick={() => {
                  if (!allDone) return;
                  setOnboardingComplete(true);
                }}
              >
                Finish onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {showAlertBanner && <AlertBanner />}
      {showStatsCards && <StatsCards />}
      {showChart && <FinancialFlowChart />}
      {showTable && <PatientsTable />}
    </main>
  );
}
