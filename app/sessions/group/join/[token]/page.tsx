"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CalendarDays, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { groupSessionApi } from "@/lib/api/groupSession";
import { getSessionMode } from "@/lib/constants/groupSessionModes";
import type { GroupSession } from "@/types/groupSession";
import type { SessionModeId } from "@/lib/constants/groupSessionModes";

type PageState = "loading" | "ready" | "joining" | "joined" | "error" | "expired" | "full";

export default function JoinGroupSessionPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [session, setSession] = useState<GroupSession | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch session by UUID derived from invite token path
  useEffect(() => {
    if (!token) return;
    groupSessionApi
      .getSessionSummary(token, token)
      .then(({ session: s }) => {
        if (s.status === "expired" || s.status === "cancelled") {
          setPageState("expired");
          return;
        }
        if (s.current_participants >= s.max_participants) {
          setPageState("full");
          return;
        }
        setSession(s);
        setPageState("ready");
      })
      .catch(() => {
        setPageState("error");
        setErrorMsg("This invitation link is invalid or has expired.");
      });
  }, [token]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/login?from=${next}`);
      return;
    }

    setPageState("joining");
    try {
      await groupSessionApi.joinSession(token, token);
      setPageState("joined");
      setTimeout(() => {
        router.push(`/sessions/group/${session?.uuid ?? token}`);
      }, 2000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not accept invitation.";
      setErrorMsg(msg);
      setPageState("error");
    }
  };

  if (pageState === "loading") {
    return (
      <PageShell>
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (pageState === "expired") {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle size={28} className="text-destructive" />}
          title="This invitation has expired"
          message="The session this link was for is no longer available. Contact the session organiser for a new link."
          iconBg="bg-destructive/10"
        />
      </PageShell>
    );
  }

  if (pageState === "full") {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle size={28} style={{ color: "var(--amber-warm)" }} />}
          title="Session is full"
          message="All spots for this session have been filled."
          iconBg=""
          iconStyle={{ backgroundColor: "var(--amber-light)" }}
        />
      </PageShell>
    );
  }

  if (pageState === "error") {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle size={28} className="text-destructive" />}
          title="Link unavailable"
          message={errorMsg || "This link is invalid or has already been used."}
          iconBg="bg-destructive/10"
        />
      </PageShell>
    );
  }

  if (pageState === "joined") {
    return (
      <PageShell>
        <StatusCard
          icon={<CheckCircle2 size={28} style={{ color: "var(--teal)" }} />}
          title="You're in!"
          message="Session confirmed. Taking you there now…"
          iconBg=""
          iconStyle={{ backgroundColor: "var(--teal-light)" }}
        />
      </PageShell>
    );
  }

  if (!session) return null;

  const modeId = (session.mode ??
    (session.session_type === "couple"
      ? "couples"
      : session.session_type)) as SessionModeId;

  let modeConfig;
  try {
    modeConfig = getSessionMode(modeId);
  } catch {
    modeConfig = null;
  }

  const therapistName = session.therapist
    ? `${session.therapist.user.first_name} ${session.therapist.user.last_name}`.trim()
    : "";

  const scheduledDate = new Date(session.scheduled_at).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );
  const scheduledTime = new Date(session.scheduled_at).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" }
  );

  const priceKobo = session.price_per_seat_kobo ?? 0;
  const priceNgn = priceKobo / 100;

  return (
    <PageShell>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header band */}
        <div
          className="px-6 py-6"
          style={{ backgroundColor: modeConfig ? `${modeConfig.icon}05` : "hsl(var(--muted))" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--teal-light)" }}
          >
            <span className="text-2xl">{modeConfig?.icon ?? "👥"}</span>
          </div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--teal)" }}
          >
            {modeConfig?.label ?? "Group Session"}
          </p>
          <h1 className="text-xl font-bold text-foreground leading-snug">
            {session.title}
          </h1>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4 border-t border-border">
          <DetailRow
            icon={<CalendarDays size={15} className="text-muted-foreground" />}
            label={scheduledDate}
            sub={scheduledTime}
          />
          <DetailRow
            icon={<Clock size={15} className="text-muted-foreground" />}
            label={`${session.duration_minutes ?? 60} minutes`}
            sub="Session duration"
          />
          {therapistName && (
            <DetailRow
              icon={<User size={15} className="text-muted-foreground" />}
              label={therapistName}
              sub="Your therapist"
            />
          )}
          {session.description && (
            <p className="text-sm text-muted-foreground pt-2 border-t border-border leading-relaxed">
              {session.description}
            </p>
          )}
        </div>

        {/* Confidentiality note for couples */}
        {modeId === "couples" && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-lg border-l-4 text-xs leading-relaxed"
            style={{ borderColor: "#fe814b", backgroundColor: "#fff8f5", color: "#4b3425" }}
          >
            <strong>Private & confidential.</strong> Only you, your partner, and your therapist will be present.
          </div>
        )}

        {/* Payment note */}
        {priceNgn > 0 && (
          <div
            className="mx-6 mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: "var(--amber-light)", color: "#4b3425" }}
          >
            Your share: <strong>₦{priceNgn.toLocaleString()}</strong> — payable on confirmation.
          </div>
        )}

        {/* CTA */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleJoin}
            disabled={pageState === "joining"}
            className="w-full py-3 font-bold"
            style={{ backgroundColor: "var(--teal)", color: "#fff" }}
          >
            {pageState === "joining" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Joining…
              </span>
            ) : modeId === "couples" ? (
              "Accept & Join Session"
            ) : (
              "Join Session"
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              You&apos;ll be asked to sign in to confirm.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 pt-16 pb-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  message,
  iconBg,
  iconStyle,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  iconBg?: string;
  iconStyle?: React.CSSProperties;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${iconBg ?? ""}`}
        style={iconStyle}
      >
        {icon}
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
