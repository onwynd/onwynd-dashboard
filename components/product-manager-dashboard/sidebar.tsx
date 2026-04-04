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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Hammer,
  FileCode,
  Rocket,
  Settings,
  ListTodo,
  Activity
} from "lucide-react";

// Icon mapping
const icons = {
  LayoutDashboard,
  Hammer,
  FileCode,
  Rocket,
  Settings,
  ListTodo,
  Activity
};

const menuItems = [
  {
    title: "Dashboard",
    href: "/product-manager/dashboard",
    icon: "LayoutDashboard"
  },
  {
    title: "Maintenance",
    href: "/product-manager/maintenance",
    icon: "Hammer"
  },
  {
    title: "Feature Requests",
    href: "/product-manager/features",
    icon: "ListTodo"
  },
  {
    title: "Roadmap",
    href: "/product-manager/roadmap",
    icon: "Rocket"
  },
  {
    title: "System Health",
    href: "/product-manager/health",
    icon: "Activity"
  }
];

export function ProductManagerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Rocket className="w-6 h-6 text-primary" />
          <span>Product Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons] || LayoutDashboard;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
