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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutGrid,
  ChartArea,
  Mail,
  Calendar,
  FileText,
  Users,
  HelpCircle,
  Settings,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  LogOut,
  UserCircle,
  Target,
  Building2,
  CheckSquare,
  Wallet,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

const menuItems = [
  { title: "AI Assistant", icon: Sparkles,    href: "/sales/assistant", isGradient: true  },
  { title: "Dashboard",    icon: LayoutGrid,  href: "/sales/dashboard"                     },
  { title: "Approvals",    icon: CheckSquare, href: "/sales/approvals"                     },
  { title: "Leads",        icon: UserCircle,  href: "/sales/leads"                         },
  { title: "Deals",        icon: ChartArea,   href: "/sales/deals"                         },
  { title: "Budget",       icon: Wallet,      href: "/sales/budget"                        },
  { title: "Emails",       icon: Mail,        href: "/sales/emails"                        },
  { title: "Calendar",     icon: Calendar,    href: "/sales/calendar"                      },
  { title: "Tasks",        icon: FileText,    href: "/sales/tasks"                         },
  { title: "Contacts",     icon: Users,       href: "/sales/contacts"                      },
];

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [foldersOpen, setFoldersOpen] = React.useState(true);
  const [userRole, setUserRole] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserRole(u?.role || Cookies.get("user_role") || "");
      } else {
        setUserRole(Cookies.get("user_role") || "");
      }
    } catch {
      setUserRole(Cookies.get("user_role") || "");
    }
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const roleSlug = Cookies.get("user_role") || "sales";

  // Sales role can also access closer pages (view/add/update deals at closing stage)
  const isCloser  = ["closer", "sales", "vp_sales", "admin", "founder", "ceo"].includes(userRole);
  const isBuilder = ["builder", "relationship_manager"].includes(userRole);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/sales/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Sales CRM</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride={roleSlug} />
      </div>

      {/* ── Nav ── */}
      <SidebarContent className="px-2 pt-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Closer Dashboard — visible for closer role */}
              {isCloser && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-9 font-medium mb-1",
                      isActive("/sales/closer")
                        ? "bg-amber-100 text-amber-900 border-l-2 border-amber-600"
                        : "text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800"
                    )}
                  >
                    <Link href="/sales/closer">
                      <Target className="size-4 text-amber-600 shrink-0" />
                      <span className="text-sm">Closer Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Builder / Relationship Manager Dashboard */}
              {isBuilder && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-9 font-medium mb-1",
                      isActive("/sales/dashboard")
                        ? "bg-blue-100 text-blue-900 border-l-2 border-blue-600"
                        : "text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800"
                    )}
                  >
                    <Link href="/sales/dashboard">
                      <Building2 className="size-4 text-blue-600 shrink-0" />
                      <span className="text-sm">Accounts Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "h-9",
                      isActive(item.href)
                        ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                        : item.isGradient
                        ? "text-violet-600 hover:bg-violet-50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pipelines collapsible — links to filtered leads views */}
        <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="flex items-center justify-between px-0 text-[11px] font-semibold tracking-wider text-muted-foreground">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", !foldersOpen && "-rotate-90")}
                  />
                  PIPELINES
                </div>
              </CollapsibleTrigger>
              <MoreHorizontal className="size-4 cursor-pointer hover:text-foreground transition-colors" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="mt-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-9 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                      <Link href="/sales/leads">
                        <ChartArea className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">All Leads</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-9 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                      <Link href="/sales/deals">
                        <ChartArea className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">Active Deals</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-9 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                      <Link href="/sales/tasks">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">Follow-ups</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="px-2 pb-4 border-t pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Link href="/sales/tasks">
                <HelpCircle className="size-4 shrink-0" />
                <span className="text-sm">Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Link href="/sales/calendar">
                <Settings className="size-4 shrink-0" />
                <span className="text-sm">Preferences</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 text-gray-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => authService.logout()}
            >
              <LogOut className="size-4 shrink-0" />
              <span className="text-sm">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
