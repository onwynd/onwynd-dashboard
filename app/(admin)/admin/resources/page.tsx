"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Check,
  X,
  FileText,
  Trash2,
  Filter,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ResourceCategory {
  id: number;
  name: string;
  slug: string;
}

interface Resource {
  id: number | string;
  title: string;
  type: string;
  status: string;
  category: string | ResourceCategory | null;
  created_at: string;
  description?: string;
}

function getResourceStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
    case "published":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "pending":
    case "under_review":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    case "draft":
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

const initialForm = {
  title: "",
  type: "",
  category: "",
  description: "",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (categoryFilter && categoryFilter !== "all") {
        params.category = categoryFilter;
      }
      const data = await adminService.getResources(params);
      const list: Resource[] = Array.isArray(data) ? data : [];
      setResources(list);

      const uniqueCategories = Array.from(new Set(
        list.map((r) => (typeof r.category === "object" && r.category !== null ? r.category.name : r.category)).filter(Boolean)
      ));
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error("Failed to fetch resources", error);
      toast({ title: "Error", description: "Failed to fetch resources", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleCreate = async () => {
    if (!form.title || !form.type) {
      toast({ title: "Validation Error", description: "Please fill in title and type.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createResource({
        title: form.title,
        type: form.type,
        resource_category_id: Number.isFinite(Number(form.category)) ? Number(form.category) : undefined,
        content: form.description,
      });
      toast({ title: "Success", description: "Resource created successfully." });
      setIsDialogOpen(false);
      setForm(initialForm);
      fetchResources();
    } catch (error) {
      console.error("Failed to create resource", error);
      toast({ title: "Error", description: "Failed to create resource.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string | number) => {
    try {
      await adminService.approveResource(id);
      toast({ title: "Success", description: "Resource approved." });
      fetchResources();
    } catch (error) {
      console.error("Failed to approve resource", error);
      toast({ title: "Error", description: "Failed to approve resource.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await adminService.rejectResource(id);
      toast({ title: "Success", description: "Resource rejected." });
      fetchResources();
    } catch (error) {
      console.error("Failed to reject resource", error);
      toast({ title: "Error", description: "Failed to reject resource.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await adminService.deleteResource(id);
      toast({ title: "Success", description: "Resource deleted." });
      fetchResources();
    } catch (error) {
      console.error("Failed to delete resource", error);
      toast({ title: "Error", description: "Failed to delete resource.", variant: "destructive" });
    }
  };

  const getCategoryName = (cat: Resource["category"]) =>
    typeof cat === "object" && cat !== null ? cat.name : (cat ?? "");

  const filteredResources =
    categoryFilter === "all"
      ? resources
      : resources.filter((r) => getCategoryName(r.category) === categoryFilter);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
          <p className="text-muted-foreground">Manage resources, approve or reject submissions.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Resource
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={(v: string | null) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No resources found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.title}</TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell>{getCategoryName(resource.category) || "—"}</TableCell>
                    <TableCell>{getResourceStatusBadge(resource.status)}</TableCell>
                    <TableCell>{resource.created_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(resource.status?.toLowerCase() === "pending" ||
                          resource.status?.toLowerCase() === "under_review") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(resource.id)}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(resource.id)}
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(resource.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Resource</DialogTitle>
            <DialogDescription>Fill in the details for the new resource.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v: string | null) => setForm({ ...form, type: v ?? "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
