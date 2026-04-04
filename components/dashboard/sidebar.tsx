"use client";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Calendar, Award, Sparkles, BookOpen, CreditCard, CheckSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Therapy", icon: Users, href: "/therapists" },
    { label: "Sessions", icon: Calendar, href: "/sessions" },
    { label: "Gamification", icon: Award, href: "/gamification" },
    { label: "AI Companion", icon: Sparkles, href: "/chat" },
    { label: "Habits", icon: CheckSquare, href: "/habits" },
    { label: "Resources", icon: BookOpen, href: "/resources" },
    { label: "Payments", icon: CreditCard, href: "/payments" },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold text-primary">Onwynd</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}