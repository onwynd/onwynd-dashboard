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
  FileText,
  CreditCard,
  Calendar,
  Settings,
  FileBarChart,
  UserPlus,
  LogOut,
  Bell,
  Building2,
  Briefcase,
  Network,
  CheckSquare,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard",       href: "/hr/dashboard",          icon: LayoutDashboard },
  { title: "Employees",       href: "/hr/employees",          icon: Users           },
  { title: "Departments",     href: "/hr/departments",        icon: Building2       },
  { title: "Designations",    href: "/hr/designations",       icon: Briefcase       },
  { title: "Org Chart",       href: "/hr/org-chart",          icon: Network         },
  { title: "Approvals",       href: "/hr/approvals",          icon: CheckSquare     },
  { title: "Payroll",         href: "/hr/payroll",            icon: CreditCard      },
  { title: "Leave Requests",  href: "/hr/leave",              icon: Calendar        },
  { title: "Benefits",        href: "/hr/benefits",           icon: FileText        },
  { title: "Recruitment",     href: "/hr/recruitment",        icon: UserPlus        },
  { title: "Reports",         href: "/hr/reports",            icon: FileBarChart    },
  { title: "Settings",        href: "/hr/settings",           icon: Settings        },
  { title: "Notifications",   href: "/settings/notifications",icon: Bell            },
];

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/hr/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">HR Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="hr" />
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
                    tooltip={item.title}
                    className={cn(
                      isActive(item.href)
                        ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
