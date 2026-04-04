"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number;
  leadName: string;
}

export function HandoffModal({ isOpen, onClose, leadId, leadName }: HandoffModalProps) {
  const [rmId, setRmId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock RMs for now
  const relationshipManagers = [
    { id: "2", name: "Jane Builder" },
    { id: "3", name: "Bob Relationship" },
  ];

  async function handleHandoff() {
    if (!rmId) return;
    setLoading(true);
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        // Simple fetch, assuming auth header is handled by interceptor or manually if not using apiClient
        // Using localStorage directly for simplicity in this task context
        const token = localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state?.token : null;
        
        await fetch(`${baseUrl}/v1/sales/leads/${leadId}/handoff`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                assigned_to: rmId,
                handoff_note: note
            })
        });
        onClose();
        // In real app, trigger refresh of leads
    } catch (error) {
        console.error("Handoff failed", error);
    } finally {
        setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hand Off Lead</DialogTitle>
          <DialogDescription>
            Transfer {leadName} to a Relationship Manager.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rm">Relationship Manager</Label>
            <Select onValueChange={(val) => setRmId(val || "")} value={rmId}>
              <SelectTrigger>
                <SelectValue placeholder="Select RM" />
              </SelectTrigger>
              <SelectContent>
                {relationshipManagers.map((rm) => (
                  <SelectItem key={rm.id} value={rm.id}>
                    {rm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Handoff Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Key context, next steps..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleHandoff} disabled={!rmId || loading}>
            {loading ? "Handing off..." : "Hand Off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
