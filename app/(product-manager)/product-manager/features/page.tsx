"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Download, MoreVertical, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { pmService } from "@/lib/api/pm"
import { FeatureForm, FeatureFormValues } from "@/components/product-manager/features/feature-form"
import { downloadCSV } from "@/lib/export-utils"

export default function FeaturesPage() {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingFeature, setEditingFeature] = useState<any>(null)

  const fetchFeatures = useCallback(async () => {
    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== "all") params.status = statusFilter
      if (priorityFilter !== "all") params.priority = priorityFilter

      const response = await pmService.getFeaturesList(params)
      // Handle pagination structure from Laravel
      if (response.data && response.data.data) {
        setFeatures(response.data.data)
      } else if (Array.isArray(response.data)) {
        setFeatures(response.data)
      } else {
        setFeatures([])
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load features",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter, priorityFilter, toast])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const handleCreate = async (data: FeatureFormValues) => {
    try {
      await pmService.createFeature(data)
      toast({
        title: "Success",
        description: "Feature created successfully",
      })
      fetchFeatures()
      setIsDialogOpen(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to create feature",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (data: FeatureFormValues) => {
    if (!editingFeature) return
    try {
      await pmService.updateFeature(editingFeature.id, data)
      toast({
        title: "Success",
        description: "Feature updated successfully",
      })
      fetchFeatures()
      setEditingFeature(null)
      setIsDialogOpen(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) return
    try {
      await pmService.deleteFeature(id)
      toast({
        title: "Success",
        description: "Feature deleted successfully",
      })
      fetchFeatures()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      })
    }
  }

  const exportCSV = () => {
    const headers = ["ID", "Title", "Status", "Priority", "Quarter", "Target Date"]
    const rows = features.map((f) => ({
      ID: f.id,
      Title: f.title,
      Status: f.status,
      Priority: f.priority,
      Quarter: f.quarter || "",
      "Target Date": f.target_date || "",
    }))
    downloadCSV("features.csv", headers, rows)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "backlog": return "bg-gray-500"
      case "planned": return "bg-blue-500"
      case "in_progress": return "bg-yellow-500"
      case "in_qa": return "bg-purple-500"
      case "completed": return "bg-green-500"
      case "released": return "bg-green-700"
      default: return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-gray-500"
      case "medium": return "text-blue-500"
      case "high": return "text-orange-500"
      case "critical": return "text-red-500 font-bold"
      default: return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Features</h2>
          <p className="text-muted-foreground">
            Manage and track product features, status, and priorities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFeature(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingFeature ? "Edit Feature" : "Create New Feature"}</DialogTitle>
                <DialogDescription>
                  {editingFeature ? "Update feature details." : "Add a new feature to the product backlog."}
                </DialogDescription>
              </DialogHeader>
              <FeatureForm
                defaultValues={editingFeature || undefined}
                onSubmit={editingFeature ? handleUpdate : handleCreate}
                onOpenChange={setIsDialogOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features List</CardTitle>
          <CardDescription>
            A list of all features including their status and priority.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string | null) => setStatusFilter(value ?? "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="in_qa">In QA</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value: string | null) => setPriorityFilter(value ?? "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : features.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No features found.
                    </TableCell>
                  </TableRow>
                ) : (
                  features.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">{feature.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className={getPriorityColor(feature.priority)}>
                        {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                      </TableCell>
                      <TableCell>{feature.quarter || "-"}</TableCell>
                      <TableCell>{feature.target_date || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setEditingFeature(feature)
                              setIsDialogOpen(true)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(feature.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
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
        </CardContent>
      </Card>
    </div>
  )
}
