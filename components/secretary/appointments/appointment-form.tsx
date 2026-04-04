"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { secretaryService, type Appointment } from "@/lib/api/secretary"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const appointmentSchema = z.object({
  patient_name: z.string().min(2, "Patient name is required"),
  doctor_name: z.string().min(2, "Doctor name is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  initialData?: (Partial<Appointment> & { id: number })
  onSuccess?: () => void
}

export function AppointmentForm({ initialData, onSuccess }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_name: initialData?.patient_name || "",
      doctor_name: initialData?.doctor_name || "",
      start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : "",
      end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : "",
      type: initialData?.type?.toLowerCase() || "video",
      notes: initialData?.notes || "",
    },
  })

  async function onSubmit(data: AppointmentFormValues) {
    setIsLoading(true)
    try {
      // Add title from notes or default
      const payload = {
        ...data,
        end_time: data.end_time || data.start_time,
        title: data.notes || "Therapy Session",
        status: "scheduled" as const,
      };

      if (initialData) {
        await secretaryService.updateAppointment(initialData.id, payload)
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        })
      } else {
        await secretaryService.createAppointment(payload)
        toast({
          title: "Success",
          description: "Appointment created successfully",
        })
      }
      onSuccess?.()
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input placeholder="Search patient..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doctor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor/Therapist Name</FormLabel>
                <FormControl>
                  <Input placeholder="Search doctor..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
