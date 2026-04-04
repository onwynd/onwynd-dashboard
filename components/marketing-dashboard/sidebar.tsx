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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  ChartArea,
  Mail,
  Calendar,
  FileText,
  Users,
  Folder,
  HelpCircle,
  Settings,
  ChevronRight,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  ChevronsUpDown,
  Atom,
  LogOut,
  UserCircle,
  CreditCard,
  Wallet,
  Receipt,
  CheckSquare,
} from "lucide-react";

const menuItems = [
  {
    title: "AI Assistant",
    icon: Sparkles,
    href: "/marketing/assistant",
    isGradient: true,
  },
  {
    title: "Dashboard",
    icon: LayoutGrid,
    href: "/marketing/dashboard",
    isActive: true,
  },
  {
    title: "Campaigns",
    icon: ChartArea,
    href: "/marketing/campaigns",
  },
  {
    title: "Leads",
    icon: Users,
    href: "/marketing/leads",
  },
  {
    title: "Emails",
    icon: Mail,
    href: "/marketing/emails",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/marketing/calendar",
  },
  {
    title: "Tasks",
    icon: FileText,
    href: "/marketing/tasks",
  },
  {
    title: "Contacts",
    icon: Users,
    href: "/marketing/contacts",
  },
  {
    title: "Ambassador Settings",
    icon: Settings,
    href: "/marketing/ambassador-settings",
  },
  {
    title: "Promo Codes",
    icon: CreditCard,
    href: "/admin/promo-codes",
  },
  {
    title: "Subscribers",
    icon: Users,
    href: "/marketing/subscribers",
  },
  {
    title: "Approvals",
    icon: CheckSquare,
    href: "/marketing/approvals",
  },
  {
    title: "Budget Requests",
    icon: Wallet,
    href: "/marketing/budget",
  },
  {
    title: "Campaign Expenses",
    icon: Receipt,
    href: "/marketing/expenses",
  },
];

const folders = [
  { name: "TechCorp Upgrade", hasNotification: true },
  { name: "Fintra Expansion", hasNotification: true },
  { name: "Nova Redesign", hasNotification: true },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [foldersOpen, setFoldersOpen] = React.useState(true);
  const [userName, setUserName] = React.useState("Marketer");
  const [userEmail, setUserEmail] = React.useState("");
  const [userAvatar, setUserAvatar] = React.useState("");
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Marketer");
        setUserEmail(u?.email || "");
        setUserAvatar(u?.profile_photo || u?.avatar || "");
      }
    } catch {}
  }, []);

  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-3 sm:p-4 lg:p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
            <Atom className="size-3" />
          </div>
          <span className="font-semibold text-base sm:text-lg">OnWynd Marketing</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 lg:px-5">
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg border bg-card p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="flex size-8 sm:size-[34px] items-center justify-center rounded-lg bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white shrink-0">
            <Atom className="size-4 sm:size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs sm:text-sm">Marketing Portal</p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-3 sm:size-3.5" />
              <span className="text-[10px] sm:text-xs">Marketing Manager</span>
            </div>
          </div>
        </div>

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="h-9 sm:h-[38px]"
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={`size-4 sm:size-5 ${
                          item.isGradient ? "text-[#6e3ff3]" : ""
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          item.isGradient
                            ? "bg-clip-text text-transparent bg-linear-to-r from-[#6e3ff3] to-[#df3674]"
                            : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.isActive && (
                        <ChevronRight className="ml-auto size-4 text-muted-foreground opacity-60" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="flex items-center justify-between px-0 text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <ChevronDown
                    className={`size-3 sm:size-3.5 transition-transform ${
                      foldersOpen ? "" : "-rotate-90"
                    }`}
                  />
                  FOLDERS
                </div>
              </CollapsibleTrigger>
              <MoreHorizontal className="size-4 cursor-pointer hover:text-foreground transition-colors" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="mt-2">
                  {folders.map((folder) => (
                    <SidebarMenuItem key={folder.name}>
                      <SidebarMenuButton asChild className="h-9 sm:h-[38px]">
                        <Link href="#">
                          <Folder className="size-4 sm:size-5 text-muted-foreground" />
                          <span className="flex-1 text-muted-foreground text-sm truncate">
                            {folder.name}
                          </span>
                          {folder.hasNotification && (
                            <div className="size-1.5 rounded-full bg-[#6e3ff3] shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 sm:h-[38px]">
              <Link href="#">
                <HelpCircle className="size-4 sm:size-5" />
                <span className="text-sm">Help Center</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 sm:h-[38px]">
              <Link href="#">
                <Settings className="size-4 sm:size-5" />
                <span className="text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <Avatar className="size-7 sm:size-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs sm:text-sm">{userName}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>
              <UserCircle className="size-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="size-4 mr-2" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
