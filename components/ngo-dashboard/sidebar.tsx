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
  Activity,
  FileBarChart,
  TrendingUp,
  Coins,
  Share2,
  FolderOpen,
  CreditCard,
  Bell,
  LogOut,
  HeartHandshake,
  Globe,
  Megaphone,
  BookOpen,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { institutionalService } from "@/lib/api/institutional";

const menuItems = [
  { title: "Dashboard",          href: "/ngo/dashboard",        icon: LayoutDashboard },
  { title: "Members",            href: "/ngo/members",          icon: Users           },
  { title: "At-Risk Members",    href: "/ngo/at-risk",          icon: Activity        },
  { title: "Programmes",         href: "/ngo/programmes",       icon: HeartHandshake  },
  { title: "Outreach",           href: "/ngo/outreach",         icon: Megaphone       },
  { title: "Impact Reports",     href: "/ngo/reports",          icon: FileBarChart    },
  { title: "Resources",          href: "/ngo/resources",        icon: BookOpen        },
  { title: "Partnerships",       href: "/ngo/partnerships",     icon: Globe           },
  { title: "Quota & Seats",      href: "/ngo/quota",            icon: TrendingUp      },
  { title: "Billing",            href: "/ngo/billing",          icon: Coins           },
  { title: "Referrals",          href: "/ngo/referrals",        icon: Share2          },
  { title: "Documents",          href: "/ngo/documents",        icon: FolderOpen      },
  { title: "Subscription",       href: "/ngo/subscription",     icon: CreditCard      },
  { title: "Notifications",      href: "/settings/notifications", icon: Bell          },
];

export function NgoSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [unreviewedCount, setUnreviewedCount] = useState(0);

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
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/ngo/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">
              NGO Portal
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* User block */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="ngo_admin" />
      </div>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const showBadge = item.href === "/ngo/at-risk" && unreviewedCount > 0;
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
                        {showBadge && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white px-1">
                            {unreviewedCount > 99 ? "99+" : unreviewedCount}
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
