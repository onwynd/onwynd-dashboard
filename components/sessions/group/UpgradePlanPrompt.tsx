"use client";

import { Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrgSubscription } from "@/types/orgSubscription";

interface UpgradePlanPromptProps {
  orgId: string | number;
  currentPlan: OrgSubscription | null;
  scenario: "no_access" | "credits_exhausted";
  onUpgradeClick: () => void;
}

export function UpgradePlanPrompt({
  currentPlan,
  scenario,
  onUpgradeClick,
}: UpgradePlanPromptProps) {
  const planName =
    currentPlan?.plan_name ??
    currentPlan?.plan?.name ??
    "your current plan";

  const renewsAt = currentPlan?.renews_at ?? currentPlan?.next_billing_date;
  const formattedRenewsAt = renewsAt
    ? new Date(renewsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const credits =
    currentPlan?.credits_remaining ??
    currentPlan?.quota_balance ??
    currentPlan?.features?.group_session_credits;

  if (scenario === "credits_exhausted") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-lg mx-auto">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "var(--amber-light)" }}
        >
          <Calendar size={24} style={{ color: "var(--amber-warm)" }} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">
          You&apos;ve used your group session credits this month
        </h2>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          {formattedRenewsAt
            ? `Your next credits arrive on ${formattedRenewsAt}.`
            : "Your credits refresh at the start of your next billing cycle."}
          {" "}In the meantime, you can upgrade for more.
        </p>
        {formattedRenewsAt && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              backgroundColor: "var(--amber-light)",
              color: "var(--amber-warm)",
            }}
          >
            <Calendar size={14} />
            Credits arrive {formattedRenewsAt}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="sm" asChild>
            <a href="/sessions/group">View your sessions</a>
          </Button>
          <Button
            size="sm"
            onClick={onUpgradeClick}
            style={{ backgroundColor: "var(--amber-warm)", color: "#fff" }}
          >
            Get more credits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-lg mx-auto">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: "var(--teal-light)" }}
      >
        <Sparkles size={24} style={{ color: "var(--teal)" }} />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">
        Unlock group sessions for your organisation
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Your current {planName} doesn&apos;t include group therapy sessions.
        Upgrade to add this for your team.
      </p>

      {/* Feature comparison bullets */}
      <ul className="text-left text-sm text-muted-foreground space-y-2 mb-6 max-w-xs mx-auto">
        {[
          "Group sessions (couples, family, corporate)",
          "Recurring weekly / biweekly sessions",
          "Org roster import & bulk invites",
          "Priority therapist matching",
        ].map((feat) => (
          <li key={feat} className="flex items-start gap-2">
            <span
              className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "var(--teal-light)" }}
            >
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                <path
                  d="M1 3L3 5L7 1"
                  stroke="var(--teal)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feat}
          </li>
        ))}
      </ul>

      <Button
        onClick={onUpgradeClick}
        className="w-full sm:w-auto"
        style={{ backgroundColor: "var(--teal)", color: "#fff" }}
      >
        Unlock group sessions
      </Button>
    </div>
  );
}
