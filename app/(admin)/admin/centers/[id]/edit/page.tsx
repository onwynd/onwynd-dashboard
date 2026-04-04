"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { adminService } from "@/lib/api/admin";
import client from "@/lib/api/client";

interface Center {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  manager_id?: string;
  status: "active" | "inactive";
}

interface Manager {
  id: string;
  name: string;
  email: string;
}

export default function AdminCenterFormPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.id as string;
  const isEdit = !!centerId;

  const [formData, setFormData] = useState<Center>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    manager_id: "",
    status: "active",
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCenter = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getCenter(centerId) as any;
      setFormData(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch center details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const fetchManagers = async () => {
    try {
      const res = await client.get("/api/v1/admin/centers/available-managers");
      setManagers(res.data?.data ?? res.data ?? []);
    } catch {
      // Non-critical — manager picker simply shows empty
    }
  };

  useEffect(() => {
    fetchManagers();
    if (isEdit) {
      fetchCenter();
    }
  }, [isEdit, centerId, fetchCenter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await adminService.updateCenter(centerId, formData as unknown as Record<string, unknown>);
      } else {
        await adminService.createCenter(formData as unknown as Record<string, unknown>);
      }

      toast({
        title: "Success",
        description: `Center ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/admin/centers");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEdit ? "update" : "create"} center`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Center" : "Create Center"}
        </h1>
        <Button variant="outline" onClick={() => router.push("/admin/centers")}>
          Back to Centers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Center Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Center Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter center name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="center@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: (value ?? "active") as "active" | "inactive" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter center description (optional)"
                rows={3}
              />
            </div>

            {managers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="manager_id">Manager</Label>
                <Select
                  value={formData.manager_id || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Manager</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/centers")}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : (isEdit ? "Update Center" : "Create Center")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
