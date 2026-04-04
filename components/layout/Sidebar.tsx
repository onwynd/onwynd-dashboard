"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/api/auth";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "AI Companion",
      icon: Sparkles,
      href: "/chat",
    },
    {
      label: "Therapists",
      icon: Users,
      href: "/therapists",
    },
    {
      label: "Sessions",
      icon: Calendar,
      href: "/sessions",
    },
    {
      label: "Habits",
      icon: CheckSquare,
      href: "/habits",
    },
    {
      label: "Assessments",
      icon: FileText,
      href: "/assessments",
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/appointments",
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/payments",
    },
  ];

  return (
    <Sidebar className="border-r" collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center">
          <OnwyndLogo variant="horizontal" className="group-data-[collapsible=icon]:hidden" />
          <OnwyndLogo variant="icon" className="hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <div className="px-2 mb-4 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 bg-muted/50 border-none"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.label}
                  >
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

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/settings"}
                  tooltip="Settings"
                >
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
