"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bell,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  ChevronDown,
  Search,
  Settings,
  ChevronRight,
  Check,
  User,
  LogOut,
  Share2,
  Gift,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/ambassador/dashboard" },
  { icon: Share2, label: "Referrals", href: "/ambassador/referrals" },
  { icon: DollarSign, label: "Earnings", href: "/ambassador/earnings" },
  { icon: Gift, label: "Rewards", href: "/ambassador/rewards" },
  { icon: Users, label: "Network", href: "/ambassador/network" },
  { icon: Settings, label: "Settings", href: "/ambassador/settings" },
];

const favorites = [
  { icon: Award, label: "Leaderboard", href: "#" },
  { icon: TrendingUp, label: "Analytics", href: "#" },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [favoritesOpen, setFavoritesOpen] = React.useState(true);
  const [userName, setUserName] = React.useState("Ambassador");
  const [userEmail, setUserEmail] = React.useState("");
  const [userAvatar, setUserAvatar] = React.useState("");
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(
          u?.name ||
            [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
            "Ambassador"
        );
        setUserEmail(u?.email || "");
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
              <div className="size-7 rounded-full overflow-hidden bg-linear-to-br from-orange-400 via-pink-500 to-purple-500 flex items-center justify-center ring-1 ring-white/40 shadow-lg" />
              <span className="font-medium text-muted-foreground">
                Ambassador
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <div className="size-5 rounded-full bg-linear-to-br from-orange-400 via-pink-500 to-purple-500 mr-2" />
                Ambassador Portal
                <Check className="size-4 ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bell className="size-4 hover:text-foreground transition-colors cursor-pointer" />
            <div className="size-2 rounded-full bg-red-500 absolute top-6 right-6 border-2 border-background" />
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search referrals..."
            className="pl-9 bg-background/50 border-muted-foreground/20 focus:bg-background transition-colors"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 text-xs font-medium px-2 py-2 uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="w-full justify-start gap-3 h-10 rounded-lg px-3 transition-all hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:shadow-sm font-medium"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4.5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-2">
            <SidebarGroupLabel className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wider">
              Quick Access
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 hover:bg-muted"
              onClick={() => setFavoritesOpen(!favoritesOpen)}
            >
              <ChevronRight
                className={cn(
                  "size-3 transition-transform text-muted-foreground",
                  favoritesOpen && "rotate-90"
                )}
              />
            </Button>
          </div>
          {favoritesOpen && (
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {favorites.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      className="w-full justify-start gap-3 h-9 rounded-lg px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
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
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-muted/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
