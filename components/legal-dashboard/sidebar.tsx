"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Scale, FileText, Shield, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/legal/dashboard" },
  { icon: Scale, label: "Cases", href: "/legal/cases" },
  { icon: FileText, label: "Documents", href: "/legal/documents" },
  { icon: Shield, label: "Compliance", href: "/legal/compliance" },
  { icon: Users, label: "Team", href: "/legal/team" },
  { icon: Settings, label: "Settings", href: "/legal/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Legal Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
