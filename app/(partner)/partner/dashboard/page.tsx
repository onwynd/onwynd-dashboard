"use client";

// Partner Dashboard — Onwynd
//
// Who lands here:
//   • HMOs (Clearline, others) managing covered member sessions
//   • Health distribution partners (Clafiya, etc.)
//   • HSA administrators managing employee wellness credits
//   • Corporate wellness distribution partners
//
// Data contract: GET /api/v1/partner/stats
//   Returns: enrolled_members, sessions_this_month, commission_earned,
//            pending_payout, utilisation_rate, active_members
//
// Layout: PartnerSidebar + DashboardHeader (both pre-built in components/)
// Content: existing DashboardContent (stats → chart → members table)
// Partner type badge: read from user.partner_type in localStorage

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/partner-dashboard/sidebar";
import { DashboardHeader } from "@/components/partner-dashboard/header";
import { DashboardContent } from "@/components/partner-dashboard/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  ShieldCheck,
  HandHeart,
  Wallet,
  ExternalLink,
} from "lucide-react";

// Partner type display config — covers all current and future distribution partners
const PARTNER_TYPE_CONFIG: Record<
  string,
  { label: string; description: string; color: string; Icon: React.ElementType }
> = {
  hmo: {
    label: "HMO Partner",
    description:
      "Your members access therapy sessions covered under your health plan. Commission accrues per completed session.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    Icon: ShieldCheck,
  },
  hsa: {
    label: "HSA Administrator",
    description:
      "Your plan holders use Onwynd credits for eligible mental wellness sessions. Utilisation reports are available monthly.",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Icon: Wallet,
  },
  distribution: {
    label: "Distribution Partner",
    description:
      "You distribute Onwynd access to organisations and individuals. Referral commissions are tracked and paid monthly.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    Icon: HandHeart,
  },
  corporate: {
    label: "Corporate Partner",
    description:
      "You manage employee wellness benefits. Your staff access sessions through their benefit allocation.",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    Icon: Building2,
  },
};

const DEFAULT_TYPE = PARTNER_TYPE_CONFIG.distribution;

export default function PartnerDashboard() {
  const [partnerType, setPartnerType] = useState<
    (typeof PARTNER_TYPE_CONFIG)[string]
  >(DEFAULT_TYPE);
  const [partnerName, setPartnerName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const typeKey = (
          u?.partner_type ||
          u?.organization_type ||
          "distribution"
        ).toLowerCase();
        setPartnerType(PARTNER_TYPE_CONFIG[typeKey] ?? DEFAULT_TYPE);
        setPartnerName(
          u?.organization_name ||
            u?.company ||
            [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
            "Partner"
        );
        setContactEmail(u?.email || "");
      }
    } catch {
      // keep defaults
    }
  }, []);

  const { label, description, color, Icon } = partnerType;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/50">
        <PartnerSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />

          {/* Partner identity strip — shows type + onboarding nudge */}
          <div className="px-4 sm:px-6 pt-5 pb-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Partner type badge */}
              <Badge
                variant="outline"
                className={`${color} flex items-center gap-1.5 px-3 py-1 text-xs font-medium w-fit`}
              >
                <Icon className="size-3.5" />
                {label}
              </Badge>

              {partnerName && (
                <span className="text-sm text-muted-foreground font-medium">
                  {partnerName}
                </span>
              )}
            </div>

            {/* Contextual description card — shown once, dismissible */}
            <Card className="border-dashed bg-card/60">
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                  {contactEmail && (
                    <>
                      {" "}
                      Questions?{" "}
                      <a
                        href="mailto:partners@onwynd.com"
                        className="underline underline-offset-2 hover:text-foreground transition-colors inline-flex items-center gap-0.5"
                      >
                        Contact your account manager
                        <ExternalLink className="size-3" />
                      </a>
                      .
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard content: stats → financial flow chart → members table */}
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
