
// filepath: components/sales-dashboard/sidebar.tsx
"use client";
import React from "react";
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutGrid, Users, DollarSign, Building } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { title: "Dashboard", icon: LayoutGrid, href: "/sales/dashboard" },
    { title: "Deals", icon: DollarSign, href: "/sales/deals" },
    { title: "Organizations", icon: Building, href: "/sales/organizations" },
    { title: "Leads", icon: Users, href: "/sales/leads" },
];

export function SalesSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href;

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
