
// filepath: components/therapist-dashboard/content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTherapistStore } from "@/store/therapist-store";
import { cn } from "@/lib/utils";
import { OnboardingWizard } from "./onboarding-wizard";
import { TermsDialog } from "./terms-dialog";
import { VerificationStatusBanner } from "./verification-status-banner";
import { StatsCards } from "./stats-cards";
import { FinancialFlowChart } from "./financial-flow-chart";
import { EarningsBreakdown } from "./earnings-breakdown";
import { PatientsTable } from "./patients-table";
import { Skeleton } from "@/components/ui/skeleton";
import { safeCall } from "@/lib/utils/safe-api";

export function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();
  const {
    profile,
    stats,
    financialFlow,
    loadingProfile,
    loadingStats,
    loadingFinancialFlow,
    layoutDensity,
    fetchProfile,
    fetchDashboardData,
    acceptTerms,
    completeOnboardingStep,
  } = useTherapistStore();
  
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !hasRole("therapist")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole("therapist")) {
      safeCall(fetchProfile, "Failed to load profile.");
      safeCall(fetchDashboardData, "Failed to load dashboard data.");
    }
  }, [isAuthenticated, hasRole, fetchProfile, fetchDashboardData]);

  useEffect(() => {
      if (profile && !profile.terms_accepted_at) {
          setShowTerms(true);
      }
  }, [profile]);

  if (!isAuthenticated || !hasRole("therapist") || loadingProfile) {
    return (
        <div className="p-8 space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid gap-4 md:grid-cols-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    );
  }

  const isOnboardingComplete = profile?.onboarding_steps_completed?.length === 4;

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      <TermsDialog 
        open={showTerms} 
        onOpenChange={setShowTerms}
        onAccept={acceptTerms}
      />
      
      {profile?.verification_status && <VerificationStatusBanner status={profile.verification_status} />}

      {!isOnboardingComplete && (
        <OnboardingWizard 
            completedSteps={profile?.onboarding_steps_completed ?? []}
            onStepComplete={completeOnboardingStep}
        />
      )}

      {loadingStats ? <StatsSkeleton /> : <StatsCards stats={stats} />}
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {loadingFinancialFlow ? <ChartSkeleton /> : <FinancialFlowChart data={financialFlow} />}
          </div>
          <div className="xl:col-span-1">
            <EarningsBreakdown />
          </div>
      </div>
      
      <PatientsTable />

    </main>
  );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}

function ChartSkeleton() {
    return <Skeleton className="h-[400px] w-full" />;
}
