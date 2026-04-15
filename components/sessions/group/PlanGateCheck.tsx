"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orgSubscriptionApi } from "@/lib/api/orgSubscription";
import { UpgradePlanPrompt } from "./UpgradePlanPrompt";
import type { OrgSubscription } from "@/types/orgSubscription";

interface PlanGateCheckProps {
  orgId: string | number;
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}

type GateState = "loading" | "allowed" | "no_access" | "credits_exhausted" | "error";

export function PlanGateCheck({
  orgId,
  children,
  onUpgradeClick,
}: PlanGateCheckProps) {
  const [state, setState] = useState<GateState>("loading");
  const [plan, setPlan] = useState<OrgSubscription | null>(null);

  const checkAccess = async () => {
    setState("loading");
    try {
      const activePlan = await orgSubscriptionApi.getActivePlan(orgId);
      setPlan(activePlan);

      if (!activePlan || !["active", "trial"].includes(activePlan.status)) {
        setState("no_access");
        return;
      }

      const features = activePlan.features ?? activePlan.plan?.features;
      if (!features?.group_session_creation) {
        setState("no_access");
        return;
      }

      const credits =
        activePlan.credits_remaining ??
        activePlan.quota_balance ??
        features.group_session_credits;

      if (credits !== "unlimited" && (typeof credits !== "number" || credits <= 0)) {
        setState("credits_exhausted");
        return;
      }

      setState("allowed");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Unable to check your plan. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={checkAccess}>
          Retry
        </Button>
      </div>
    );
  }

  if (state === "no_access" || state === "credits_exhausted") {
    return (
      <UpgradePlanPrompt
        orgId={orgId}
        currentPlan={plan}
        scenario={state === "credits_exhausted" ? "credits_exhausted" : "no_access"}
        onUpgradeClick={onUpgradeClick ?? (() => {})}
      />
    );
  }

  return <>{children}</>;
}
