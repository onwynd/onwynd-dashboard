"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { employeeService } from "@/lib/api/employee";
import { Loader2, LogIn, LogOut, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface TimesheetEntry {
  id: number;
  date: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  status: string;
}

export default function TimesheetPage() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);

  const fetchTimesheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await employeeService.getTimesheet();
      setEntries(res.data ?? res ?? []);
    } catch {
      toast({ description: "Failed to load timesheet", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimesheet();
  }, [fetchTimesheet]);

  const handleClockIn = async () => {
    setIsClockingIn(true);
    try {
      await employeeService.clockIn();
      toast({ description: "Clocked in successfully" });
      fetchTimesheet();
    } catch {
      toast({ description: "Failed to clock in", variant: "destructive" });
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockingOut(true);
    try {
      await employeeService.clockOut();
      toast({ description: "Clocked out successfully" });
      fetchTimesheet();
    } catch {
      toast({ description: "Failed to clock out", variant: "destructive" });
    } finally {
      setIsClockingOut(false);
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "—";
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
        <p className="text-muted-foreground">
          Track your work hours with clock-in and clock-out.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clock In</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Start tracking your work hours for today.
            </p>
            <Button onClick={handleClockIn} disabled={isClockingIn} className="w-full">
              {isClockingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Clock className="mr-2 h-4 w-4" />
              Clock In
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clock Out</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Stop tracking and record your hours.
            </p>
            <Button onClick={handleClockOut} disabled={isClockingOut} variant="outline" className="w-full">
              {isClockingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Clock className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheet Entries</CardTitle>
          <CardDescription>Your recorded work hours.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No timesheet entries found. Clock in to start tracking.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatTime(entry.clock_in)}</TableCell>
                    <TableCell>{formatTime(entry.clock_out)}</TableCell>
                    <TableCell>{entry.hours_worked != null ? `${entry.hours_worked.toFixed(1)}h` : "—"}</TableCell>
                    <TableCell className="capitalize">{entry.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
