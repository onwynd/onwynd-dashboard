"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown, Minus, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pmService } from "@/lib/api/pm";
import { toast } from "@/components/ui/use-toast";

import { FeatureForm } from "@/components/product-manager/features/feature-form";

interface Feature {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  quarter: string;
  target_date: string;
  created_at: string;
}

interface BacklogTableProps {
  data: Feature[];
  onUpdate: () => void;
}

export function BacklogTable({ data, onUpdate }: BacklogTableProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Feature; direction: 'asc' | 'desc' } | null>(null);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'high': return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'low': return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      backlog: "bg-gray-500",
      planned: "bg-blue-500",
      in_progress: "bg-yellow-500",
      in_qa: "bg-purple-500",
      completed: "bg-green-500",
      released: "bg-green-700"
    };
    return <Badge className={variants[status] || "bg-gray-500"}>{status.replace('_', ' ')}</Badge>;
  };

  // Filter and Sort Logic
  const filteredData = data.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          feature.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || feature.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || feature.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Feature) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Title,Description,Status,Priority,Quarter,Target Date\n"
      + sortedData.map(f => `${f.id},"${f.title}","${f.description || ''}",${f.status},${f.priority},${f.quarter || ''},${f.target_date || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "backlog_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!selectedFeature) return;
    setIsLoading(true);
    try {
      await pmService.deleteFeature(selectedFeature.id);
      toast({ title: "Success", description: "Feature deleted successfully" });
      onUpdate();
      setIsDeleteOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to delete feature", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: unknown) => {
    if (!selectedFeature) return;
    setIsLoading(true);
    try {
      await pmService.updateFeature(selectedFeature.id, data);
      toast({ title: "Success", description: "Feature updated successfully" });
      onUpdate();
      setIsEditOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to update feature", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_qa">In QA</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="released">Released</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v: string | null) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>Priority</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>Title</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('quarter')}>Quarter</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('target_date')}>Target Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell>{getPriorityIcon(feature.priority)}</TableCell>
                <TableCell className="font-medium">
                  {feature.title}
                  <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {feature.description}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(feature.status)}</TableCell>
                <TableCell>{feature.quarter || '-'}</TableCell>
                <TableCell>{feature.target_date ? format(new Date(feature.target_date), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedFeature(feature); setIsEditOpen(true); }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedFeature(feature); setIsDeleteOpen(true); }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No features found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
          </DialogHeader>
          <FeatureForm
            key={selectedFeature?.id}
            defaultValues={selectedFeature ?? undefined}
            onSubmit={handleEdit}
            onOpenChange={setIsEditOpen}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feature</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete &quot;{selectedFeature?.title}&quot;? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
