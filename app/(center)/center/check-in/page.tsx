"use client";

import { useState } from "react";
import { centerService } from "@/lib/api/center";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function CheckInPage() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<{
    name: string;
    time: string;
  } | null>(null);

  const handleCheckIn = async () => {
    if (!patientName && !patientId) {
      toast({
        title: "Validation Error",
        description: "Please provide a patient name or ID.",
        variant: "destructive",
      });
      return;
    }
    if (!serviceType) {
      toast({
        title: "Validation Error",
        description: "Please select a service type.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await centerService.checkIn({
        patient_name: patientName,
        patient_id: patientId,
        service_type: serviceType,
      });
      toast({ title: "Success", description: "Patient checked in successfully." });
      setLastCheckIn({
        name: patientName || `Patient #${patientId}`,
        time: new Date().toLocaleTimeString(),
      });
      setPatientName("");
      setPatientId("");
      setServiceType("");
    } catch (error) {
      console.error("Check-in failed", error);
      toast({ title: "Error", description: "Check-in failed. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check In</h1>
        <p className="text-muted-foreground">Check in patients for their appointments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Patient Check-In
            </CardTitle>
            <CardDescription>Enter the patient details and service type to check them in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID (optional)</Label>
                <Input
                  id="patient_id"
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={serviceType} onValueChange={(v: string | null) => setServiceType(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="therapy">Therapy Session</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-Up</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="group_session">Group Session</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCheckIn}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Check In Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {lastCheckIn && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Last Check-In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{lastCheckIn.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked In At</span>
                  <span className="font-medium">{lastCheckIn.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
