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
  Calendar,
  Coins,
  FileText,
  Settings,
  Video,
  UserCircle,
  Clock,
  BookOpenText,
  LogOut,
  ArrowLeftRight,
  MessageSquare,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { settingsService } from "@/lib/api/settings";
import Cookies from "js-cookie";

const baseMenu = [
  { icon: LayoutDashboard, label: "Dashboard",        href: "/therapist/dashboard"   },
  { icon: UserCircle,      label: "My Profile",        href: "/therapist/profile"     },
  { icon: Calendar,        label: "Appointments",      href: "/therapist/appointments"},
  { icon: Clock,           label: "Availability",      href: "/therapist/availability"},
  { icon: Users,           label: "Patients",          href: "/therapist/patients"    },
  { icon: Video,           label: "Sessions",          href: "/therapist/sessions"    },
  { icon: FileText,        label: "Notes",             href: "/therapist/notes"       },
  { icon: Coins,           label: "Earnings",          href: "/therapist/earnings"    },
  { icon: MessageSquare,   label: "Messages",          href: "/therapist/messages"    },
  { icon: Settings,        label: "Settings",          href: "/therapist/settings"    },
  { icon: BookOpenText,    label: "Terms & Earnings",  href: `${process.env.NEXT_PUBLIC_WEB_URL || "https://www.onwynd.com"}/therapist-terms` as string },
];

export function TherapistSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [menuItems, setMenuItems] = useState<typeof baseMenu>(baseMenu);
  const [isClinical, setIsClinical] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const role = Cookies.get("user_role") || "therapist";
    setIsClinical(role === "clinical_advisor");
    (async () => {
      try {
        const s = await settingsService.getSettings();
        const nav = s?.navigation?.disabled_routes || {};
        const dis: string[] = nav?.[role] || [];
        setMenuItems(baseMenu.filter((i) => !dis.some((p: string) => i.href.startsWith(p))));
      } catch {
        setMenuItems(baseMenu);
      }
    })();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/therapist/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Therapist Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="therapist" />
      </div>

      {/* ── Nav ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className={cn(
                      isActive(item.href)
                        ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-4 border-t space-y-1">
        {isClinical && (
          <Link href="/clinical/dashboard" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-teal hover:text-teal hover:bg-teal/10 group-data-[collapsible=icon]:justify-center"
            >
              <ArrowLeftRight className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Back to Clinical</span>
            </Button>
          </Link>
        )}
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
