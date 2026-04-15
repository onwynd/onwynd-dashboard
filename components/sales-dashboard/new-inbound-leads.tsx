"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { PermissionGate } from "@/components/shared/PermissionGate";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  company: string;
  created_at: string;
}

export function NewInboundLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  async function fetchInbound() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        // Attempt to get token from storage
        const token = localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state?.token : null;
        
        const res = await fetch(`${baseUrl}/v1/sales/leads?unassigned=true&source=demo_form`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setLeads(data.data.data || []);
        }
    } catch (e) {
        console.error(e);
    }
  }

  async function assignToMe(id: number) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state?.token : null;
        
        await fetch(`${baseUrl}/v1/sales/leads/${id}/assign-me`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchInbound(); // Refresh list
      } catch (e) {
          console.error(e);
      }
  }

  useEffect(() => {
      fetchInbound();
  }, []);

  if (leads.length === 0) return null;

  return (
    <Card className="mb-6 border-l-4 border-l-orange-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          New Inbound Leads
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {leads.length} Unassigned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{lead.company}</p>
                <p className="text-sm text-muted-foreground">{lead.first_name} {lead.last_name} • {formatDistanceToNow(new Date(lead.created_at))} ago</p>
              </div>
              <PermissionGate resource="leads" permission="write">
                <Button size="sm" onClick={() => assignToMe(lead.id)}>Assign to Me</Button>
              </PermissionGate>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
