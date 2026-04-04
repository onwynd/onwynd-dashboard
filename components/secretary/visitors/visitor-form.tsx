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
import { secretaryService, type Visitor } from "@/lib/api/secretary"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const visitorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  purpose: z.string().min(2, "Purpose is required"),
  host: z.string().min(2, "Host name is required"),
})

type VisitorFormValues = z.infer<typeof visitorSchema>

interface VisitorFormProps {
  initialData?: (Partial<Visitor> & { id: number })
  onSuccess?: () => void
}

export function VisitorForm({ initialData, onSuccess }: VisitorFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      purpose: initialData?.purpose || "",
      host: initialData?.host || "",
    },
  })

  async function onSubmit(data: VisitorFormValues) {
    setIsLoading(true)
    try {
      if (initialData) {
        // Update
        await secretaryService.updateVisitor(initialData.id, data)
        toast({
          title: "Success",
          description: "Visitor updated successfully",
        })
      } else {
        const payload = {
          ...data,
          email: data.email || "",
          phone: data.phone || "",
          check_in_time: new Date().toISOString(),
          status: "checked_in" as const,
        };
        await secretaryService.createVisitor(payload)
        toast({
          title: "Success",
          description: "Visitor checked in successfully",
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visitor Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose of Visit</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting, Delivery, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host / Person Visiting</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Visitor" : "Check In Visitor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
