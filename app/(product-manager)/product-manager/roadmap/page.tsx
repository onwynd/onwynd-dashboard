"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar, MoreVertical, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { pmService } from "@/lib/api/pm"
import { FeatureForm, FeatureFormValues } from "@/components/product-manager/features/feature-form";

export default function RoadmapPage() {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [roadmapData, setRoadmapData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null)

  const fetchRoadmap = async () => {
    setIsLoading(true)
    try {
      const response = await pmService.getRoadmap()
      // API returns grouped data directly or in data property
      if (Array.isArray(response)) {
        setRoadmapData(response)
      } else if (response.data && Array.isArray(response.data)) {
        setRoadmapData(response.data)
      } else {
        setRoadmapData([])
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load roadmap",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (data: FeatureFormValues) => {
    try {
      await pmService.createRoadmapItem(data)
      toast({
        title: "Success",
        description: "Roadmap item created successfully",
      })
      fetchRoadmap()
      setIsDialogOpen(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to create roadmap item",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (data: FeatureFormValues) => {
    if (!editingItem) return
    try {
      await pmService.updateRoadmapItem(editingItem.id, data)
      toast({
        title: "Success",
        description: "Roadmap item updated successfully",
      })
      fetchRoadmap()
      setEditingItem(null)
      setIsDialogOpen(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update roadmap item",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roadmap item?")) return
    try {
      await pmService.deleteRoadmapItem(id)
      toast({
        title: "Success",
        description: "Roadmap item deleted successfully",
      })
      fetchRoadmap()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete roadmap item",
        variant: "destructive",
      })
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Product Roadmap</h2>
          <p className="text-muted-foreground">
            Visualize and manage the product roadmap by quarter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Roadmap Item" : "Add Roadmap Item"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update item details." : "Add a new item to the roadmap."}
                </DialogDescription>
              </DialogHeader>
              <FeatureForm
                defaultValues={editingItem || undefined}
                onSubmit={editingItem ? handleUpdate : handleCreate}
                onOpenChange={setIsDialogOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading roadmap...</div>
        ) : roadmapData.length === 0 ? (
          <div className="col-span-full text-center py-12">No roadmap data available.</div>
        ) : (
          roadmapData.map((group) => (
            <div key={group.quarter} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{group.quarter}</h3>
                <Badge variant="outline">{group.features.length} items</Badge>
              </div>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {group.features.map((feature: any) => (
                  <Card key={feature.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 space-y-0">
                      <div className="flex justify-between items-start">
                        <Badge className={`${getStatusColor(feature.status)} mb-2`}>
                          {feature.status.replace("_", " ")}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setEditingItem(feature)
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
                      </div>
                      <CardTitle className="text-sm font-medium leading-none">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {feature.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={getPriorityColor(feature.priority)}>
                          {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                        </span>
                        {feature.target_date && (
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(feature.target_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
