
// filepath: components/clinical-dashboard/sidebar.tsx
"use client";
import React from "react";
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutGrid, ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { title: "Dashboard", icon: LayoutGrid, href: "/clinical/dashboard" },
    { title: "Session Reviews", icon: ShieldCheck, href: "/clinical/session-audits" },
    { title: "Distress Queue", icon: AlertTriangle, href: "/clinical/distress-queue" },
    { title: "Therapist Profiles", icon: UserCheck, href: "/clinical/therapist-reviews" },
];

export function ClinicalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <Sidebar {...props}>
            <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive(item.href)}
                            className={cn(isActive(item.href) && "bg-gray-100")}
                        >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </Sidebar>
    );
}
