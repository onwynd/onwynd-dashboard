"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import {
  Search,
  LayoutDashboard,
  Calendar,
  Users,
  Folder,
  ChevronDown,
  Settings,
  HelpCircle,
  Check,
  Stethoscope,
  FileText,
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import { UpgradeCard } from "./upgrade-card";
import Link from "next/link";

const BASE = "/health-personnel";

const NAV_ITEMS = [
  { href: `${BASE}/dashboard`,  icon: LayoutDashboard, label: "Dashboard" },
  { href: `${BASE}/check-in`,   icon: Users,           label: "Check-In"  },
  { href: `${BASE}/schedule`,   icon: Calendar,        label: "Schedule"  },
  { href: `${BASE}/records`,    icon: Folder,          label: "Records"   },
  { href: `${BASE}/equipment`,  icon: Stethoscope,     label: "Equipment" },
  { href: `${BASE}/reports`,    icon: FileText,        label: "Reports"   },
];

const FAVORITES = [
  { href: `${BASE}/records/recent`,   letter: "R", label: "Recent Records"    },
  { href: `${BASE}/schedule/today`,   letter: "T", label: "Today's Schedule"  },
];

export function HealthSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [favoritesOpen, setFavoritesOpen] = useState(true);

  return (
    <Sidebar className="lg:border-r-0!" collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-2 py-3">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between gap-3 h-auto p-0 hover:bg-transparent w-full"
                >
                  <div className="flex items-center gap-2">
                    <OnwyndLogo variant="icon" width={24} height={24} className="shrink-0" />
                    <OnwyndLogo variant="horizontal" width={80} height={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                      HP
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <OnwyndLogo variant="icon" width={24} height={24} className="shrink-0" />
                    <OnwyndLogo variant="horizontal" width={80} height={20} />
                    <Check className="size-4 ml-auto" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-9 pl-8 bg-sidebar-accent/50 border-sidebar-border"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton isActive={pathname === href || pathname.startsWith(href + "/")} asChild>
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible
          open={favoritesOpen}
          onOpenChange={setFavoritesOpen}
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                Favorites
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {FAVORITES.map(({ href, letter, label }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton isActive={pathname === href} asChild>
                        <Link href={href}>
                          <div className="flex size-4 items-center justify-center rounded-sm border text-[10px] font-medium text-muted-foreground">
                            {letter}
                          </div>
                          <span>{label}</span>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname.startsWith(`${BASE}/settings`)} asChild>
              <Link href={`${BASE}/settings`}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/help">
                <HelpCircle className="size-4" />
                <span>Help &amp; Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UpgradeCard />
      </SidebarFooter>
    </Sidebar>
  );
}
