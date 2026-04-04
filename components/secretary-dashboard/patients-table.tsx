"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Search, Phone, Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSecretaryStore } from "@/store/secretary-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { secretaryService } from "@/lib/api/secretary";
import { useToast } from "@/components/ui/use-toast";

const patientSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(), // Optional for update? No, create needs it.
});

// Separate schema for create to require password
const createPatientSchema = patientSchema.extend({
    password: z.string().min(8, "Password is required"),
});

export function PatientsTable() {
  const { patients, fetchPatients } = useSecretaryStore();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<(typeof patients)[0] | null>(null);
  const [editPatient, setEditPatient] = useState<(typeof patients)[0] | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients({ search });
  }, [fetchPatients, search]);

  const form = useForm<z.infer<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  const openEditPatient = (p: (typeof patients)[0]) => {
    setEditPatient(p);
    const parts = p.name?.split(" ") ?? [];
    setEditForm({ first_name: parts[0] ?? "", last_name: parts.slice(1).join(" "), email: p.email, phone_number: p.phone ?? "" });
  };

  const handleEditSave = async () => {
    if (!editPatient) return;
    setEditSaving(true);
    try {
      await secretaryService.updatePatient(editPatient.id, editForm);
      toast({ title: "Success", description: "Patient updated" });
      setEditPatient(null);
      fetchPatients();
    } catch {
      toast({ title: "Error", description: "Failed to update patient", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivate = async (p: (typeof patients)[0]) => {
    if (!confirm(`Deactivate ${p.name}?`)) return;
    try {
      await secretaryService.updatePatient(p.id, { status: "inactive" });
      toast({ description: "Patient deactivated" });
      fetchPatients();
    } catch {
      toast({ title: "Error", description: "Failed to deactivate", variant: "destructive" });
    }
  };

  const onSubmit = async (values: z.infer<typeof createPatientSchema>) => {
    try {
      const payload = {
        name: `${values.first_name} ${values.last_name}`.trim(),
        email: values.email,
        phone: values.phone_number || "",
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
      };
      await secretaryService.createPatient(payload);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      setIsCreateOpen(false);
      form.reset();
      fetchPatients();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to create patient",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Register a new patient to the system.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Patient</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.avatar || ""} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {patient.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        {patient.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {patient.joinedDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.email)}>
                          Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setViewPatient(patient)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditPatient(patient)}>Edit Patient</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeactivate(patient)}>Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewPatient} onOpenChange={o => !o && setViewPatient(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Patient Details</DialogTitle></DialogHeader>
          {viewPatient && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewPatient.avatar ?? undefined} />
                  <AvatarFallback>{viewPatient.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{viewPatient.name}</p>
                  <Badge variant={viewPatient.status === "active" ? "default" : "secondary"}>{viewPatient.status}</Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{viewPatient.email}</div>
                {viewPatient.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{viewPatient.phone}</div>}
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Joined: {viewPatient.joinedDate}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPatient(null)}>Close</Button>
            <Button onClick={() => { openEditPatient(viewPatient!); setViewPatient(null); }}>Edit Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={!!editPatient} onOpenChange={o => !o && setEditPatient(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle>Edit Patient</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">First Name</label>
                <Input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Phone</label>
              <Input value={editForm.phone_number} onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPatient(null)} disabled={editSaving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>{editSaving ? "Saving…" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
