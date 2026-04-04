"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Filter,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supportService, Article, Category } from "@/lib/api/support";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  draft: "text-gray-500 bg-gray-50 dark:bg-gray-950/20",
  published: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
  archived: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
};

const visibilityColors: Record<string, string> = {
  public: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
  internal: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
  corporate: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
};

const defaultFormData: Partial<Article> = {
  title: "",
  content: "",
  summary: "",
  status: "draft",
  visibility: "public",
  category_id: undefined,
};

export function KnowledgeBaseTable() {
  const [data, setData] = React.useState<Article[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { toast } = useToast();

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<Partial<Article>>(defaultFormData);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [articlesResponse, categoriesResponse] = await Promise.all([
        supportService.getArticles(),
        supportService.getCategories()
      ]);
      
      const articles = articlesResponse.data || articlesResponse || [];
      const categoriesData = categoriesResponse.data || categoriesResponse || [];

      setData(Array.isArray(articles) ? articles : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch knowledge base data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      summary: article.summary || "",
      status: article.status,
      visibility: article.visibility,
      category_id: article.category_id,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content || !formData.category_id) {
        toast({
          title: "Validation Error",
          description: "Title, Content, and Category are required.",
          variant: "destructive",
        });
        return;
      }

      if (editingId) {
        await supportService.updateArticle(editingId, formData);
        toast({ title: "Success", description: "Article updated successfully." });
      } else {
        await supportService.createArticle(formData);
        toast({ title: "Success", description: "Article created successfully." });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save article:", error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supportService.deleteArticle(deleteId);
      toast({ title: "Success", description: "Article deleted successfully." });
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-medium truncate" title={row.original.title}>{row.original.title}</span>
          <span className="text-xs text-muted-foreground truncate" title={row.original.summary}>{row.original.summary}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-center gap-2">
            {category?.icon && <span className="text-lg">{category.icon}</span>}
            <span>{category?.name || "-"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
              statusColors[status] || "text-gray-500 bg-gray-50"
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      cell: ({ row }) => {
        const visibility = row.original.visibility;
        return (
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
              visibilityColors[visibility] || "text-gray-500 bg-gray-50"
            )}
          >
            {visibility}
          </span>
        );
      },
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.original.views}</div>,
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        return new Date(row.original.updated_at).toLocaleDateString();
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const article = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(article.id.toString())}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenEdit(article)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Article
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenDelete(article.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Input
              placeholder="Filter articles..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Status
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue(undefined)}>
                        All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("published")}>
                        Published
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("draft")}>
                        Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("archived")}>
                        Archived
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No articles found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{editingId ? "Edit Article" : "Create New Article"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select
                        onValueChange={(value: string | null) => setFormData({ ...formData, category_id: value ? parseInt(value) : undefined })}
                        value={formData.category_id?.toString()}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name} ({category.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select
                        onValueChange={(value: string | null) => setFormData({ ...formData, status: (value ?? "draft") as "draft" | "published" | "archived" })}
                        value={formData.status}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visibility" className="text-right">Visibility</Label>
                    <Select
                        onValueChange={(value: string | null) => setFormData({ ...formData, visibility: (value ?? "public") as "public" | "internal" | "corporate" })}
                        value={formData.visibility}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Label htmlFor="summary" className="text-right mt-2">Summary</Label>
                    <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        className="col-span-3"
                        rows={2}
                    />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Label htmlFor="content" className="text-right mt-2">Content</Label>
                    <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="col-span-3 font-mono text-sm"
                        rows={10}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
