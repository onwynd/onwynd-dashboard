"use client";

import { useEffect, useState } from "react";
import { salesService } from "@/lib/api/sales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Loader2, MoreHorizontal, Mail, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  created_at: string;
}

export default function SalesContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", company: "", source: "" });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await salesService.getContacts({ search: search || undefined });
      setContacts(Array.isArray(data) ? data : []);
    } catch {
      toast({ description: "Failed to load contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchContacts(); };

  const handleCreate = async () => {
    if (!form.first_name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      await salesService.createContact(form as Record<string, unknown>);
      toast({ description: "Contact added" });
      setDialogOpen(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", company: "", source: "" });
      fetchContacts();
    } catch {
      toast({ description: "Failed to add contact", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await salesService.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast({ description: "Contact removed" });
    } catch {
      toast({ description: "Failed to remove contact", variant: "destructive" });
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">All leads and contacts in your pipeline.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="Jane" />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234..." />
                </div>
                <div className="grid gap-2">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Source</Label>
                <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="Website / Referral..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !form.first_name.trim() || !form.email.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>{contacts.length} contacts in your CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                            {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{c.company ?? "—"}</TableCell>
                        <TableCell>{c.source ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-red-600">
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
