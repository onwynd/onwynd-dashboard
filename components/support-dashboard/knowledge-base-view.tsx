"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KnowledgeBaseTable } from "./knowledge-base-table";

export function KnowledgeBaseView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
      </div>
      <div className="grid gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                    Manage knowledge base articles, FAQ, and internal documentation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <KnowledgeBaseTable />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
