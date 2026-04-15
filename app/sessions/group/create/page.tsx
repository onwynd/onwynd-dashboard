"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEcho } from "@/lib/echo";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { groupSessionApi } from "@/lib/api/groupSession";
import {
  SESSION_MODES,
  INDIVIDUAL_MODES,
  ORG_MODES,
  getSessionMode,
  type SessionModeId,
} from "@/lib/constants/groupSessionModes";
import { OrgTypeDetector } from "@/components/sessions/group/OrgTypeDetector";
import { PlanGateCheck } from "@/components/sessions/group/PlanGateCheck";
import { ExternalOrgRegistrationForm } from "@/components/sessions/group/ExternalOrgRegistrationForm";
import { PaymentSplitPanel } from "@/components/sessions/group/PaymentSplitPanel";
import { InviteSharePanel } from "@/components/sessions/group/InviteSharePanel";
import { SessionConfirmedCard } from "@/components/sessions/group/SessionConfirmedCard";
import type {
  OrganiserType,
  PaymentModel,
  GroupSession,
} from "@/types/groupSession";
import type { Organisation } from "@/types/orgSubscription";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "Who is this for?",
  2: "Session type",
  3: "Group size",
  4: "Therapist & time",
  5: "Payment & invite",
};

// ─── Therapist picker (simplified — uses existing API) ────────────────────────

interface AvailableTherapist {
  id: number;
  uuid: string;
  user: { first_name: string; last_name: string; profile_photo?: string | null };
  session_rate: number;
  currency?: string;
  rating_average?: number;
  specializations?: string[];
  is_accepting_clients?: boolean;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateGroupSessionPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gate: must be authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?from=/sessions/group/create`);
    }
  }, [isAuthenticated, router]);

  // Pre-select mode from ?type= query param
  const presetType = searchParams.get("type") as SessionModeId | null;

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [organiserType, setOrganiserType] = useState<OrganiserType | null>(null);
  const [orgId, setOrgId] = useState<string | number | null>(null);
  const [registeredOrg, setRegisteredOrg] = useState<Organisation | null>(null);
  const [showOrgForm, setShowOrgForm] = useState(false);

  const [mode, setMode] = useState<SessionModeId | null>(presetType ?? null);
  const [declaredSize, setDeclaredSize] = useState(2);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");

  const [therapist, setTherapist] = useState<AvailableTherapist | null>(null);
  const [therapists, setTherapists] = useState<AvailableTherapist[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [paymentModel, setPaymentModel] = useState<PaymentModel>("split");
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState<GroupSession | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const modeConfig = mode ? getSessionMode(mode) : null;
  const totalFee = therapist
    ? Math.round((therapist.session_rate / 60) * durationMinutes)
    : 0;

  // ── Detect org role and skip step 1 ─────────────────────────────────────────
  const isOrgAdmin =
    user?.all_roles?.some((r: string) =>
      ["institutional", "institution_admin", "university_admin", "hr"].includes(r)
    ) ?? false;

  useEffect(() => {
    if (isOrgAdmin && user?.organization_id) {
      setOrganiserType("internal_org");
      setOrgId(user.organization_id);
      setStep(presetType ? 3 : 2);
    }
  }, [isOrgAdmin, user, presetType]);

  // Auto-skip step 1 if preset type is individual-compatible
  useEffect(() => {
    if (presetType && !isOrgAdmin && !organiserType) {
      if (INDIVIDUAL_MODES.includes(presetType)) {
        setOrganiserType("individual");
        setMode(presetType);
        setStep(3);
      }
    }
  }, [presetType, isOrgAdmin, organiserType]);

  // ── Fetch therapists when mode is set ────────────────────────────────────────
  const fetchTherapists = useCallback(async (selectedMode: SessionModeId) => {
    setTherapistsLoading(true);
    try {
      const spec =
        selectedMode === "couples"
          ? "Relationship"
          : selectedMode === "family"
            ? "Family"
            : selectedMode === "corporate"
              ? "Corporate"
              : selectedMode === "university"
                ? "University"
                : "Group";

      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/therapists?specialization=${spec}&is_accepting_clients=1&per_page=6`,
        { credentials: "include" }
      );
      const data = await resp.json();
      setTherapists(data?.data?.data ?? data?.data ?? []);
    } catch {
      setTherapists([]);
    } finally {
      setTherapistsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode && step === 4) {
      fetchTherapists(mode);
    }
  }, [mode, step, fetchTherapists]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleOrgTypeSelected = (type: OrganiserType, id?: string | number) => {
    setOrganiserType(type);
    if (type === "internal_org" && id) setOrgId(id);
    if (type === "external_org") {
      setShowOrgForm(true);
      return;
    }
    setStep(2);
  };

  const handleOrgRegistered = (org: Organisation) => {
    setRegisteredOrg(org);
    setOrgId(org.id);
    setShowOrgForm(false);
    setStep(2);
  };

  const handleModeSelect = (id: SessionModeId) => {
    setMode(id);
    const cfg = getSessionMode(id);
    setDeclaredSize(cfg.minParticipants);
    if (cfg.fixedSize) {
      setStep(4); // skip size step for couples
    } else {
      setStep(3);
    }
  };

  const handleCreateSession = async () => {
    if (!mode || !therapist || !scheduledAt) {
      toast({
        title: "Missing details",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const sessionType =
        mode === "couples"
          ? "couple"
          : mode === "corporate" || mode === "university"
            ? mode
            : "open";

      const payload = {
        title: title || `${modeConfig?.label} Session`,
        description: description || `A ${modeConfig?.label.toLowerCase()} therapy session on Onwynd.`,
        session_type: sessionType as GroupSession["session_type"],
        therapist_id: therapist.id,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        max_participants:
          modeConfig?.fixedSize ? modeConfig.maxParticipants : declaredSize,
        price_per_seat_kobo: totalFee * 100,
        is_org_covered: organiserType === "internal_org",
        language,
        payment_model: paymentModel,
        organiser_type: organiserType ?? "individual",
      };

      const session = await groupSessionApi.createSession(payload);
      setCreatedSession(session);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create session.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // ── Real-time: listen for new participants joining after session is created ───
  useEffect(() => {
    if (!createdSession) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel(`group-session.${createdSession.uuid}`);
    channel.listen(".participant.joined", (data: { participant_count: number; participant_name?: string }) => {
      setCreatedSession((prev) =>
        prev ? { ...prev, current_participants: data.participant_count } : prev
      );
      if (data.participant_name) {
        toast({ title: "Someone joined", description: `${data.participant_name} accepted the invite.` });
      }
    });

    return () => {
      echo.leave(`group-session.${createdSession.uuid}`);
    };
  }, [createdSession?.uuid]);

  // ── Render ────────────────────────────────────────────────────────────────────

  if (!isAuthenticated) return null;

  if (createdSession && paymentDone) {
    const therapistName = therapist
      ? `${therapist.user.first_name} ${therapist.user.last_name}`
      : "Your therapist";
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-lg mx-auto">
          <SessionConfirmedCard
            session={createdSession}
            therapistName={therapistName}
          />
        </div>
      </div>
    );
  }

  const visibleModes = SESSION_MODES.filter((m) => {
    if (organiserType === "individual") return INDIVIDUAL_MODES.includes(m.id);
    if (organiserType === "internal_org" || organiserType === "external_org")
      return ORG_MODES.includes(m.id);
    return true;
  });

  const totalSteps: Step = modeConfig?.fixedSize ? 4 : 5;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Create a group session
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps} — {STEP_LABELS[step]}
          </p>
          {/* Progress */}
          <div className="mt-4 flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < step ? "var(--teal)" : "hsl(var(--muted))",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Step 1: Who is this for? ─────────────────────────────────────── */}
        {step === 1 && !showOrgForm && (
          <OrgTypeDetector onTypeSelected={handleOrgTypeSelected} />
        )}

        {step === 1 && showOrgForm && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowOrgForm(false)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <ExternalOrgRegistrationForm onRegistered={handleOrgRegistered} />
          </div>
        )}

        {/* ── Step 2: Session mode ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                What kind of session?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose the format that fits your group.
              </p>
            </div>

            {organiserType === "internal_org" && orgId ? (
              <PlanGateCheck
                orgId={orgId}
                onUpgradeClick={() =>
                  router.push("/institutional/institutional/subscription")
                }
              >
                <ModeGrid
                  modes={visibleModes}
                  selected={mode}
                  onSelect={handleModeSelect}
                />
              </PlanGateCheck>
            ) : (
              <ModeGrid
                modes={visibleModes}
                selected={mode}
                onSelect={handleModeSelect}
              />
            )}
          </div>
        )}

        {/* ── Step 3: Group size + session details ─────────────────────────── */}
        {step === 3 && modeConfig && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Tell us about the session
              </h2>
              <p className="text-sm text-muted-foreground">
                Provide details for your {modeConfig.label.toLowerCase()}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Session title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. ${modeConfig.label} — April 2026`}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Brief description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this session focus on?"
                  rows={3}
                />
              </div>

              {!modeConfig.fixedSize && (
                <div className="space-y-1">
                  <Label>Group size</Label>
                  <p className="text-xs text-muted-foreground">
                    Min {modeConfig.minParticipants} · Max{" "}
                    {modeConfig.maxParticipants}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setDeclaredSize((v) =>
                          Math.max(modeConfig.minParticipants, v - 1)
                        )
                      }
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">
                      {declaredSize}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeclaredSize((v) =>
                          Math.min(modeConfig.maxParticipants, v + 1)
                        )
                      }
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep(4)}
              disabled={!title && !description}
              className="w-full"
              style={{ backgroundColor: "var(--teal)", color: "#fff" }}
            >
              Continue <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* ── Step 4: Therapist + slot ─────────────────────────────────────── */}
        {step === 4 && modeConfig && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Choose a therapist & time
              </h2>
              <p className="text-sm text-muted-foreground">
                All listed therapists are ready for {modeConfig.label.toLowerCase()} sessions.
              </p>
            </div>

            {therapistsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : therapists.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No therapists available right now. Try a different session type.
              </div>
            ) : (
              <div className="grid gap-3">
                {therapists.map((t) => (
                  <button
                    key={t.uuid}
                    type="button"
                    onClick={() => setTherapist(t)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150"
                    style={{
                      borderColor:
                        therapist?.uuid === t.uuid
                          ? "var(--teal)"
                          : "hsl(var(--border))",
                      backgroundColor:
                        therapist?.uuid === t.uuid
                          ? "var(--teal-light)"
                          : "hsl(var(--card))",
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground overflow-hidden flex-shrink-0">
                      {t.user.profile_photo ? (
                        <img
                          src={t.user.profile_photo}
                          alt={t.user.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${t.user.first_name[0]}${t.user.last_name[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {t.user.first_name} {t.user.last_name}
                      </p>
                      {t.rating_average ? (
                        <p className="text-xs text-muted-foreground">
                          ★ {t.rating_average.toFixed(1)}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {t.currency ?? "₦"}
                        {t.session_rate?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">/hr</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {therapist && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="date-time">Date & Time</Label>
                    <Input
                      id="date-time"
                      type="datetime-local"
                      value={scheduledAt}
                      min={new Date(Date.now() + 3600_000)
                        .toISOString()
                        .slice(0, 16)}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <select
                      id="duration"
                      value={durationMinutes}
                      onChange={(e) =>
                        setDurationMinutes(Number(e.target.value))
                      }
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {[30, 45, 60, 90].map((d) => (
                        <option key={d} value={d}>
                          {d} min
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(5)}
                  disabled={!scheduledAt}
                  className="w-full"
                  style={{ backgroundColor: "var(--teal)", color: "#fff" }}
                >
                  Continue to payment <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Payment + invite ─────────────────────────────────────── */}
        {step === 5 && modeConfig && therapist && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Review & pay
              </h2>
              <p className="text-sm text-muted-foreground">
                Once payment is received your invite link will be activated.
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
              <Row label="Session" value={title || modeConfig.label} />
              <Row
                label="Therapist"
                value={`${therapist.user.first_name} ${therapist.user.last_name}`}
              />
              <Row
                label="Date"
                value={
                  scheduledAt
                    ? new Date(scheduledAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "—"
                }
              />
              <Row
                label="Group"
                value={`${modeConfig.fixedSize ? modeConfig.maxParticipants : declaredSize} participants · ${durationMinutes} min`}
              />
            </div>

            {organiserType !== "internal_org" ? (
              <PaymentSplitPanel
                mode={modeConfig.id}
                totalFee={totalFee}
                declaredSize={
                  modeConfig.fixedSize ? modeConfig.maxParticipants : declaredSize
                }
                paymentModel={paymentModel}
                onPaymentModelChange={setPaymentModel}
                onPay={async (_ref) => {
                  await handleCreateSession();
                  setPaymentDone(true);
                }}
                currency={therapist.currency ?? "₦"}
              />
            ) : (
              <Button
                onClick={async () => {
                  await handleCreateSession();
                  setPaymentDone(true);
                }}
                disabled={creating}
                className="w-full font-bold py-3"
                style={{ backgroundColor: "var(--teal)", color: "#fff" }}
              >
                {creating && (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                )}
                Confirm & use organisation credits
              </Button>
            )}

            {createdSession && !paymentDone && (
              <div className="pt-4 border-t border-border">
                <InviteSharePanel
                  inviteLink={
                    createdSession.invite_link ??
                    `${typeof window !== "undefined" ? window.location.origin : ""}/sessions/group/join/${createdSession.uuid}`
                  }
                  paid={paymentDone}
                  mode={modeConfig.id}
                  joined={createdSession.current_participants}
                  total={createdSession.max_participants}
                />
              </div>
            )}
          </div>
        )}

        {/* Back navigation */}
        {step > 1 && !createdSession && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeGrid({
  modes,
  selected,
  onSelect,
}: {
  modes: typeof SESSION_MODES;
  selected: SessionModeId | null;
  onSelect: (id: SessionModeId) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className="text-left rounded-xl border-2 p-5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            borderColor:
              selected === m.id ? "var(--teal)" : "hsl(var(--border))",
            backgroundColor:
              selected === m.id ? "var(--teal-light)" : "hsl(var(--card))",
          }}
        >
          <div className="text-2xl mb-3">{m.icon}</div>
          <p
            className="font-semibold text-sm mb-1"
            style={{
              color:
                selected === m.id ? "var(--teal)" : "hsl(var(--foreground))",
            }}
          >
            {m.label}
          </p>
          <p className="text-xs text-muted-foreground">{m.description}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {m.minParticipants}
              {m.fixedSize ? "" : `–${m.maxParticipants}`} people
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {m.cancelHours}h cancel
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
