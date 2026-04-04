"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Shield,
  FileText,
  AlertTriangle,
  BookOpen,
  Settings,
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/compliance/dashboard",  active: true },
  { icon: ClipboardList,   label: "NDPR Checklist", href: "/compliance/ndpr"                     },
  { icon: CheckSquare,     label: "Audits",         href: "/compliance/audits"                   },
  { icon: FileText,        label: "Policies",       href: "/compliance/policies"                 },
  { icon: AlertTriangle,   label: "Incidents",      href: "/compliance/incidents"                },
  { icon: BookOpen,        label: "Training",       href: "/compliance/training"                 },
  { icon: Settings,        label: "Settings",       href: "/compliance/settings"                 },
];

export function ComplianceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Shield className="size-4" />
          </div>
          <span className="font-medium">Compliance Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        
      </SidebarFooter>
    </Sidebar>
  );
}
