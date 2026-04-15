
// filepath: components/sales-dashboard/header.tsx
"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SalesSidebar } from "./sidebar";
import { UserNav } from "@/components/shared/user-nav";

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SalesSidebar />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Can add search or breadcrumbs here */}
      </div>
      <UserNav />
    </header>
  );
}
