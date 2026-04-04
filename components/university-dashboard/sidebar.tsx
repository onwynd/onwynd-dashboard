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
  GraduationCap,
  Activity,
  FileBarChart,
  TrendingUp,
  Coins,
  Share2,
  FolderOpen,
  CreditCard,
  BadgeCheck,
  AlertCircle,
  CalendarDays,
  Stethoscope,
  Bell,
  LogOut,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { institutionalService } from "@/lib/api/institutional";

const menuItems = [
  { title: "Dashboard",            href: "/university/dashboard",          icon: LayoutDashboard },
  { title: "Students",             href: "/university/students",           icon: GraduationCap   },
  { title: "At-Risk Students",     href: "/university/at-risk",            icon: Activity        },
  { title: "Crisis Alerts",        href: "/university/crisis-alerts",      icon: AlertCircle     },
  { title: "Student Verifications",href: "/university/verifications",      icon: BadgeCheck      },
  { title: "Counselling",          href: "/university/counselling",        icon: Stethoscope     },
  { title: "Academic Calendar",    href: "/university/academic-calendar",  icon: CalendarDays    },
  { title: "Reports",              href: "/university/reports",            icon: FileBarChart    },
  { title: "Quota & Enrolment",    href: "/university/quota",              icon: TrendingUp      },
  { title: "Billing",              href: "/university/billing",            icon: Coins           },
  { title: "Referrals",            href: "/university/referrals",          icon: Share2          },
  { title: "Documents",            href: "/university/documents",          icon: FolderOpen      },
  { title: "Subscription",         href: "/university/subscription",       icon: CreditCard      },
  { title: "Notifications",        href: "/settings/notifications",        icon: Bell            },
];

export function UniversitySidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [unreviewedCount, setUnreviewedCount] = useState(0);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await institutionalService.getAtRisk() as { events?: { status: string }[] } | null;
        if (data?.events) {
          const pending = data.events.filter((e) => e.status === "pending").length;
          setUnreviewedCount(pending);
        }
      } catch {}
    })();

    (async () => {
      try {
        const data = await institutionalService.getStudentVerifications() as { pending?: number } | null;
        setPendingVerificationCount(data?.pending || 0);
      } catch {}
    })();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const getBadge = (href: string) => {
    if (href === "/university/at-risk" && unreviewedCount > 0)
      return unreviewedCount > 99 ? "99+" : String(unreviewedCount);
    if (href === "/university/crisis-alerts" && unreviewedCount > 0)
      return unreviewedCount > 99 ? "99+" : String(unreviewedCount);
    if (href === "/university/verifications" && pendingVerificationCount > 0)
      return pendingVerificationCount > 99 ? "99+" : String(pendingVerificationCount);
    return null;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/university/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">
              Student Affairs Portal
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* User block */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="university_admin" />
      </div>

      {/* Crisis detection badge */}
      <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs text-teal bg-teal/5 rounded-full px-3 py-1 border border-teal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          Crisis Detection Active
        </div>
      </div>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const badge = getBadge(item.href);
                const badgeColor =
                  item.href === "/university/verifications"
                    ? "bg-orange-500"
                    : "bg-red-600";
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
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                        {badge && (
                          <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full ${badgeColor} text-[10px] font-bold text-white px-1`}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
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
