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
  SidebarGroupLabel,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Zap,
  BarChart2,
  Users,
  Settings,
  Briefcase,
  ToggleLeft,
  Activity,
  CreditCard,
  MessageSquare,
  Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuGroups = [
  {
    title: "Product",
    items: [
      { title: "Overview", href: "/product/dashboard", icon: LayoutDashboard },
      { title: "Roadmap", href: "/product/roadmap", icon: Target },
      { title: "Backlog", href: "/product/backlog", icon: CheckSquare },
      { title: "Sprints", href: "/product/sprints", icon: Zap },
    ]
  },
  {
    title: "Analytics & Feedback",
    items: [
      { title: "Metrics", href: "/product/metrics", icon: BarChart2 },
      { title: "User Feedback", href: "/product/feedback", icon: MessageSquare },
      { title: "User Segments", href: "/product/users", icon: Users },
    ]
  },
  {
    title: "Configuration",
    items: [
      { title: "Feature Flags", href: "/product/features", icon: ToggleLeft },
      { title: "Subscription Plans", href: "/product/plans", icon: CreditCard },
      { title: "Global Settings", href: "/product/settings", icon: Settings },
    ]
  },
  {
    title: "System Status",
    items: [
      { title: "System Health", href: "/product/system/health", icon: Activity },
      { title: "Live Activity", href: "/product/activity", icon: Globe },
    ]
  }
];

export function PMSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState("Product Manager");
  const [userEmail, setUserEmail] = React.useState("");
  const [userAvatar, setUserAvatar] = React.useState("");
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Product Manager");
        setUserEmail(u?.email || "");
        setUserAvatar(u?.profile_photo || u?.avatar || "");
      }
    } catch {}
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="w-6 h-6 text-primary" />
          <span>Product Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{userName}</span>
            <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
