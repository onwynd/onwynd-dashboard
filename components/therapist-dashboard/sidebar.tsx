
// filepath: components/therapist-dashboard/sidebar.tsx
"use client";
import React from "react";
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutGrid, Users, Calendar, MessageSquare, DollarSign, Settings, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { title: "Dashboard", icon: LayoutGrid, href: "/therapist/dashboard" },
    { title: "Patients", icon: Users, href: "/therapist/patients" },
    { title: "Schedule", icon: Calendar, href: "/therapist/schedule" },
    { title: "Group Sessions", icon: UsersRound, href: "/therapist/group-sessions" },
    { title: "Messages", icon: MessageSquare, href: "/therapist/messages" },
    { title: "Earnings", icon: DollarSign, href: "/therapist/earnings" },
    { title: "Settings", icon: Settings, href: "/therapist/settings" },
];

export function TherapistSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
