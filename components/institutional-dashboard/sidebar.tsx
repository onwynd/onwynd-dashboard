"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Coins,
  TrendingUp,
  Building2,
  GraduationCap,
  CreditCard,
  Activity,
  Share2,
  FolderOpen,
  BadgeCheck,
  AlertCircle,
  LogOut,
  Bell,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useInstitutionalStore } from "@/store/institutional-store";
import { getLabel } from "@/lib/institutional/labels";
import { useEffect, useState } from "react";
import { settingsService } from "@/lib/api/settings";
import { institutionalService } from "@/lib/api/institutional";
import Cookies from "js-cookie";

const icons = {
  LayoutDashboard, Users, FileBarChart, Coins, TrendingUp,
  Building2, GraduationCap, CreditCard, Activity, Share2, FolderOpen, Bell,
};

type OrgType = "university" | "corporate" | "faith_ngo" | string | null;
type SidebarItem = {
  title: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
};

export function InstitutionalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const orgType = useInstitutionalStore((s) => s.orgType);
  const [disabledRoutes, setDisabledRoutes] = useState<Record<string, string[]>>({});
  const [unreviewedCount, setUnreviewedCount] = useState(0);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const role = typeof window !== "undefined" ? Cookies.get("user_role") : undefined;

  useEffect(() => {
    (async () => {
      try {
        const s = await settingsService.getSettings();
        const nav = s?.navigation?.disabled_routes;
        if (nav && typeof nav === "object") setDisabledRoutes(nav as Record<string, string[]>);
      } catch {
        setDisabledRoutes({});
      }
    })();

    (async () => {
      try {
        const data = await institutionalService.getAtRisk() as { events?: { status: string }[] } | null;
        if (data?.events) {
          const pending = data.events.filter((e) => e.status === "pending").length;
          setUnreviewedCount(pending);
        }
      } catch {}
    })();

    if (orgType === "university") {
      (async () => {
        try {
          const data = await institutionalService.getStudentVerifications() as { pending?: number } | null;
          setPendingVerificationCount(data?.pending || 0);
        } catch {}
      })();
    }
  }, [orgType]);

  const isDisabled = (href: string) => {
    const r = role || "institution_admin";
    const list = disabledRoutes?.[r] || [];
    return list.some((pattern) => href.startsWith(pattern));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const labels = {
    portalTitle: getLabel("portalTitle", orgType),
    portalIcon: getLabel("portalIcon", orgType) as keyof typeof icons,
    members: getLabel("members", orgType),
    atRisk: getLabel("atRisk", orgType),
    quota: getLabel("quota", orgType),
  };

  const roleSlug = orgType === "university" ? "university_admin" : "institution_admin";

  const baseMenuItems: SidebarItem[] = [
    { title: "Dashboard",      href: "/institutional/dashboard",    icon: "LayoutDashboard" },
    { title: labels.members,   href: "/institutional/members",      icon: "Users"           },
    { title: labels.atRisk,    href: "/institutional/at-risk",      icon: "Activity"        },
    { title: "Reports",        href: "/institutional/reports",      icon: "FileBarChart"    },
    { title: labels.quota,     href: "/institutional/quota",        icon: "TrendingUp"      },
    { title: "Billing",        href: "/institutional/billing",      icon: "Coins"           },
    { title: "Referrals",      href: "/institutional/referrals",    icon: "Share2"          },
    { title: "Documents",      href: "/institutional/documents",    icon: "FolderOpen"      },
    { title: "Subscription",    href: "/institutional/subscription",  icon: "CreditCard"      },
    { title: "Notifications",   href: "/settings/notifications",      icon: "Bell"            },
  ];

  const universityMenuItems: SidebarItem[] = orgType === "university" ? [
    { title: "Student Verifications", href: "/institutional/student-verifications", icon: "BadgeCheck", comingSoon: true },
    { title: "Crisis Alerts",         href: "/institutional/crisis-alerts",          icon: "AlertCircle", comingSoon: true },
  ] : [];

  const menuItems: SidebarItem[] = [...baseMenuItems, ...universityMenuItems].filter((i) => !isDisabled(i.href));

  const PortalIcon = icons[labels.portalIcon] ?? Building2;

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/institutional/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">{labels.portalTitle}</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride={roleSlug} />
      </div>

      {/* ── University: early crisis detection trust badge ── */}
      {orgType === "university" && (
        <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 text-xs text-teal bg-teal/5 rounded-full px-3 py-1 border border-teal/20">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Crisis Detection Active
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // @ts-expect-error dynamic icon key
                const Icon = icons[item.icon] || LayoutDashboard;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className={cn(
                        isActive(item.href)
                          ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {item.comingSoon ? (
                        <div className="flex items-center justify-between w-full opacity-60 cursor-not-allowed" title="Coming soon">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                              Coming soon
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Link href={item.href} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          {item.href === "/institutional/at-risk" && unreviewedCount > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white px-1">
                              {unreviewedCount > 99 ? "99+" : unreviewedCount}
                            </span>
                          )}
                          {item.href === "/institutional/student-verifications" && pendingVerificationCount > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white px-1">
                              {pendingVerificationCount > 99 ? "99+" : pendingVerificationCount}
                            </span>
                          )}
                          {item.href === "/institutional/crisis-alerts" && unreviewedCount > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white px-1">
                              {unreviewedCount > 99 ? "99+" : unreviewedCount}
                            </span>
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 group-data-[collapsible=icon]:justify-center"
          onClick={() => authService.logout()}
        >
          <LogOut className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
