"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

export default function PartnerDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">Contracts, agreements, and shared files.</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Shared Documents</CardTitle>
          <CardDescription>All documents shared with your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <FileText className="h-12 w-12 opacity-20" />
            <p className="text-sm">No documents yet. Upload your first document.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
