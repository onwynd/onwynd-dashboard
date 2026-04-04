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
  Package,
  BarChart3,
  Settings,
  Tags,
  LineChart,
  ShoppingBag,
  Layers,
  Archive,
  AlertCircle
} from "lucide-react";

// Icon mapping
const icons: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Tags,
  LineChart,
  ShoppingBag,
  Layers,
  Archive,
  AlertCircle
};

const menuItems = [
  {
    title: "Dashboard",
    href: "/product/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Products",
    href: "/product/catalog",
    icon: "Package",
  },
  {
    title: "Inventory",
    href: "/product/inventory",
    icon: "Layers",
  },
  {
    title: "Analytics",
    href: "/product/analytics",
    icon: "BarChart3",
  },
  {
    title: "Categories",
    href: "/product/categories",
    icon: "Tags",
  },
];

export function ProductSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <span>Product Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = icons[item.icon] || LayoutDashboard;
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
