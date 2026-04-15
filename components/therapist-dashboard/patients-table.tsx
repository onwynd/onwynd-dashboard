
// filepath: components/therapist-dashboard/patients-table.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Upload } from "lucide-react";
import { therapistService, Patient } from "@/lib/api/therapist";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function PatientsTable() {
  const { data: patients, isLoading } = useQuery<Patient[]>({ 
      queryKey: ["therapist-patients"], 
      queryFn: async () => {
          const { data } = await therapistService.getPatients();
          return data || [];
      }
  });

  const handleExport = () => {
    // CSV export logic here
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Patients</CardTitle>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleExport}>
                <Upload className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
            <Button size="sm" className="h-9 gap-2">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Patient</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={patient.profile_photo ?? undefined} alt={patient.first_name} />
                                <AvatarFallback>{patient.first_name[0]}{patient.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.is_active ? "default" : "outline"}>
                          {patient.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
        )}
      </CardContent>
    </Card>
  );
}
