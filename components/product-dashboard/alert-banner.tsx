"use client";

import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/product-store";

export function AlertBanner() {
  const setShowAlertBanner = useProductStore((state) => state.setShowAlertBanner);

  return (
    <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>New Feature Available!</AlertTitle>
      <AlertDescription>
        You can now batch import products from CSV files. Check the products table for more details.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-primary hover:text-primary/80 hover:bg-primary/20"
        onClick={() => setShowAlertBanner(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </Alert>
  );
}
