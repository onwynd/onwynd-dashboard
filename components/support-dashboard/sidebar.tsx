"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/layout/sidebar-provider";
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  MessageSquare, 
  BarChart2, 
  Settings,
  LogOut,
  LifeBuoy,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3",
        isActive && "bg-secondary font-medium"
      )}
      asChild
      onClick={onClick}
    >
      <Link href={href}>
        <Icon className="size-4" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}

export function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:flex",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 sm:h-16 items-center border-b px-6">
          <Link href="/support/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LifeBuoy className="size-5 text-primary" />
            </div>
            <span className="text-lg">Support Portal</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Overview" 
                href="/support/dashboard" 
                isActive={pathname === "/support/dashboard"}
                onClick={closeSidebar}
              />
              <SidebarItem 
                icon={Ticket} 
                label="Tickets" 
                href="/support/tickets" 
                isActive={pathname === "/support/tickets"}
                onClick={closeSidebar}
              />
              <SidebarItem 
                icon={Users} 
                label="Customers" 
                href="/support/customers" 
                isActive={pathname === "/support/customers"}
                onClick={closeSidebar}
              />
              <SidebarItem 
                icon={MessageSquare} 
                label="Chat" 
                href="/support/chat" 
                isActive={pathname === "/support/chat"}
                onClick={closeSidebar}
              />
            </div>

            <div>
              <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Analytics
              </h4>
              <div className="space-y-1">
                <SidebarItem 
                  icon={BarChart2} 
                  label="Reports" 
                  href="/support/reports" 
                  isActive={pathname === "/support/reports"}
                  onClick={closeSidebar}
                />
              </div>
            </div>

            <div>
              <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                System
              </h4>
              <div className="space-y-1">
                <SidebarItem 
                  icon={Settings} 
                  label="Settings" 
                  href="/support/settings" 
                  isActive={pathname === "/support/settings"}
                  onClick={closeSidebar}
                />
                <SidebarItem 
                  icon={BookOpen} 
                  label="Knowledge Base" 
                  href="/support/knowledge-base" 
                  isActive={pathname === "/support/knowledge-base"}
                  onClick={closeSidebar}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
