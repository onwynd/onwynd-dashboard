"use client";

import { useEffect, useState } from "react";
import { centerService } from "@/lib/api/center";
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
import { Loader2, Plus, Package, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface InventoryItem {
  id: number | string;
  name: string;
  quantity: number;
  status: string;
  last_restocked: string;
  category?: string;
}

function getStockStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "in_stock":
    case "in stock":
    case "available":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
    case "low_stock":
    case "low stock":
    case "low":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{status}</Badge>;
    case "out_of_stock":
    case "out of stock":
    case "unavailable":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

const initialForm = {
  name: "",
  quantity: "",
  status: "in_stock",
  category: "",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await centerService.getInventory();
      const data = response.data || response;
      const list: InventoryItem[] = Array.isArray(data) ? data : data.data || data.inventory || [];
      setItems(list);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      toast({ title: "Error", description: "Failed to fetch inventory", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.quantity) {
      toast({ title: "Validation Error", description: "Please fill in item name and quantity.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await centerService.createInventoryItem({
        name: form.name,
        quantity: parseInt(form.quantity, 10),
        status: form.status,
        category: form.category,
      });
      toast({ title: "Success", description: "Item added to inventory." });
      setIsDialogOpen(false);
      setForm(initialForm);
      fetchInventory();
    } catch (error) {
      console.error("Failed to add inventory item", error);
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await centerService.deleteInventoryItem(id);
      toast({ title: "Success", description: "Item removed from inventory." });
      fetchInventory();
    } catch (error) {
      console.error("Failed to delete item", error);
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage center supplies and equipment.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{getStockStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.last_restocked}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Enter the details for the new inventory item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Medical Supplies, Equipment"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v: string | null) => setForm({ ...form, status: v ?? "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
