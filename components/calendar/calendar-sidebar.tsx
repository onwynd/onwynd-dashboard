"use client";

import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import {
  Search,
  Home,
  Users,
  FileText,
  Calendar as CalendarIcon,
  BarChart3,
  MapPin,
  FolderOpen,
  Share2,
  DollarSign,
  Sparkles,
  GraduationCap,
  Key,
  Crown,
  Settings,
  ChevronDown,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
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
import Link from "next/link";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalendarSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [featuredOpen, setFeaturedOpen] = useState(true);

  return (
    <Sidebar className="lg:border-r-0!" collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <OnwyndLogo variant="icon" width={36} height={36} className="shrink-0" />
              <div className="flex flex-col items-start">
                <OnwyndLogo variant="horizontal" width={90} height={22} />
                <div className="flex items-center gap-1">
                  <Layers className="size-3" />
                  <span className="text-xs">Calendar</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-muted-foreground z-10" />
            <Input
              placeholder="Search anything"
              className="pl-8 pr-8 h-8 text-xs bg-neutral-100 dark:bg-background border-2 border-border"
            />
            <div className="flex items-center gap-0.5 rounded border border-border bg-sidebar px-1.5 py-0.5 shrink-0 absolute right-2 top-1/2 -translate-y-1/2">
              <span className="text-[10px] font-medium text-muted-foreground leading-none tracking-[-0.1px]">
                ⌘
              </span>
              <Kbd className="h-auto min-w-0 px-0 py-0 text-[10px] leading-none tracking-[-0.1px] bg-transparent border-0">
                K
              </Kbd>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <Home className="size-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <Users className="size-4" />
                  <span>Candidates</span>
                  <span className="ml-auto text-xs">146</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <FileText className="size-4" />
                  <span>Job Listings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  className="h-[26px] text-xs bg-neutral-100 dark:bg-muted text-zinc-950 dark:text-foreground hover:bg-neutral-100 dark:hover:bg-muted hover:text-zinc-950 dark:hover:text-foreground"
                >
                  <CalendarIcon className="size-4" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <BarChart3 className="size-4" />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <MapPin className="size-4" />
                  <span>Employees</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <FolderOpen className="size-4" />
                  <span>Files</span>
                  <Sparkles className="ml-auto size-3 text-cyan-500" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <Share2 className="size-4" />
                  <span>Time Off</span>
                  <Sparkles className="ml-auto size-3 text-cyan-500" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                  <DollarSign className="size-4" />
                  <span>Payroll</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0" />

        <SidebarGroup>
          <Collapsible open={featuredOpen} onOpenChange={setFeaturedOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="h-4 pb-4 pt-2 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer">
                <span>Featured job post</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform ml-auto",
                    featuredOpen && "rotate-180"
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                      <FileText className="size-4" />
                      <span>Senior Product Design</span>
                      <Sparkles className="ml-auto size-3 text-cyan-500" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                      <FileText className="size-4" />
                      <span>Software Engineer</span>
                      <Sparkles className="ml-auto size-3 text-cyan-500" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                      <FileText className="size-4" />
                      <span>Account Executive</span>
                      <Sparkles className="ml-auto size-3 text-cyan-500" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                      <FileText className="size-4" />
                      <span>Marketing Manager</span>
                      <Sparkles className="ml-auto size-3 text-cyan-500" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                      <FileText className="size-4" />
                      <span>Data Analyst</span>
                      <Sparkles className="ml-auto size-3 text-cyan-500" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">


        <div className="space-y-1 my-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                <Sparkles className="size-4" />
                <span>What&apos;s New</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                <GraduationCap className="size-4" />
                <span>Staff University</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                <Key className="size-4" />
                <span>API Access</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-[26px] text-xs text-zinc-950 dark:text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-muted/50 hover:text-zinc-950 dark:hover:text-foreground">
                <Crown className="size-4" />
                <span>Plans</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <div className="flex items-center gap-3">

        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
