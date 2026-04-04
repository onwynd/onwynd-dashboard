"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bell,
  Users,
  Calendar,
  Coins,
  FileText,
  Folder,
  ChevronDown,
  Search,
  Settings,
  HelpCircle,
  MessageSquare,
  Check,
  LogOut,
  Video,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true, href: "/partner/dashboard" },
  { icon: Users, label: "Employees", href: "/partner/employees" },
  { icon: Coins, label: "Financials", href: "/partner/financials" },
  { icon: FileText, label: "Documents", href: "/partner/documents" },
  { icon: Settings, label: "Settings", href: "/partner/settings" },
];

const favorites = [
  { icon: Folder, label: "Resources", href: "#" },
  { icon: Folder, label: "Guidelines", href: "#" },
];

const footerItems = [
  { icon: MessageSquare, label: "Feedback" },
  { icon: HelpCircle, label: "Help Center" },
];

export function PartnerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [favoritesOpen, setFavoritesOpen] = React.useState(true);
  const [userName, setUserName] = React.useState("Partner");
  const [userAvatar, setUserAvatar] = React.useState("");
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Partner");
        setUserAvatar(u?.profile_photo || u?.avatar || "");
      }
    } catch {}
  }, []);

  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <div className="size-7 rounded-full overflow-hidden bg-linear-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center ring-1 ring-white/40 shadow-lg" />
              <span className="font-medium text-muted-foreground">
                Partner Portal
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <div className="size-5 rounded-full bg-linear-to-br from-purple-400 via-pink-500 to-red-500 mr-2" />
                Partner Portal
                <Check className="size-4 ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Bell className="size-4" />
          </Button>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border h-9"
          />
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
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between cursor-pointer" onClick={() => setFavoritesOpen(!favoritesOpen)}>
             Favorites
             <ChevronDown className={cn("size-3 transition-transform", favoritesOpen && "rotate-180")} />
          </SidebarGroupLabel>
          {favoritesOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {favorites.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
           {footerItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
           ))}
        </SidebarMenu>

        <div className="mt-4 flex items-center gap-3 p-1">
          <Avatar className="size-8 rounded-full">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate text-foreground">{userName}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
             <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
