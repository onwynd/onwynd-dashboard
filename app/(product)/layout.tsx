import type { Metadata } from "next";
import { ProductDashboardHeader } from "@/components/product-dashboard/header";
import { ProductSidebar } from "@/components/product-dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Product Dashboard" },
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProductSidebar />
      <SidebarInset>
        <ProductDashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
