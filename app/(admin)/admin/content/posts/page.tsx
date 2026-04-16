"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Trash2,
  Filter,
  FileText,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Tag,
  RefreshCw,
  Upload,
  ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface EditorialCategory {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

interface EditorialPost {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  views_count: number;
  read_time_minutes: number | null;
  created_at: string;
  author?: { id: number; first_name: string; last_name: string };
  categories?: EditorialCategory[];
}

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  featured_image: "",
  status: "draft" as "draft" | "published" | "archived",
  read_time_minutes: "",
  category_ids: [] as number[],
};

function statusBadge(status: string) {
  switch (status) {
    case "published":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>;
    case "draft":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Draft</Badge>;
    case "archived":
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function authorName(author?: { first_name: string; last_name: string }) {
  if (!author) return "—";
  return `${author.first_name} ${author.last_name}`.trim();
}

export default function EditorialPostsPage() {
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [categories, setCategories] = useState<EditorialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Post form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<EditorialPost | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload — works for both create and edit
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await adminService.getEditorialPosts(params);
      const data = (res as any)?.data ?? res;
      // API returns a Laravel paginator: { current_page, data: [...], total, ... }
      const list: EditorialPost[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : [];
      setPosts(list);
    } catch {
      toast({ title: "Error", description: "Failed to fetch editorial posts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminService.getEditorialCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // non-critical, categories may be empty
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateDialog = () => {
    setEditingPost(null);
    setForm(initialForm);
    setSelectedImageFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = async (post: EditorialPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: "",
      featured_image: "",
      status: post.status,
      read_time_minutes: post.read_time_minutes?.toString() ?? "",
      category_ids: post.categories?.map((c) => c.id) ?? [],
    });
    // Fetch full content
    try {
      // Full post data is already in the post object from the list
      // No need to fetch additional data since the form uses the existing post data
    } catch {
      // proceed with partial data
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingPost) {
        // Edit: JSON update, then optional image upload
        const payload: Record<string, unknown> = {
          title: form.title,
          excerpt: form.excerpt || undefined,
          content: form.content,
          featured_image: form.featured_image || undefined,
          status: form.status,
          read_time_minutes: form.read_time_minutes ? Number(form.read_time_minutes) : undefined,
          category_ids: form.category_ids.length > 0 ? form.category_ids : undefined,
        };
        await adminService.updateEditorialPost(editingPost.id, payload);
        if (selectedImageFile) {
          await adminService.uploadEditorialPostImage(editingPost.id, selectedImageFile);
        }
        toast({ title: "Success", description: "Article updated." });
      } else {
        // Create: use FormData so we can attach image in one request
        const fd = new FormData();
        fd.append("title", form.title);
        if (form.excerpt) fd.append("excerpt", form.excerpt);
        fd.append("content", form.content);
        fd.append("status", form.status);
        if (form.featured_image && !selectedImageFile) fd.append("featured_image", form.featured_image);
        if (form.read_time_minutes) fd.append("read_time_minutes", form.read_time_minutes);
        form.category_ids.forEach((id: number) => fd.append("category_ids[]", String(id)));
        if (selectedImageFile) fd.append("image", selectedImageFile);
        await adminService.createEditorialPost(fd as unknown as Record<string, unknown>);
        toast({ title: "Success", description: "Article created." });
      }

      setIsDialogOpen(false);
      setSelectedImageFile(null);
      fetchPosts();
    } catch {
      toast({ title: "Error", description: "Failed to save article.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (post: EditorialPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteEditorialPost(post.id);
      toast({ title: "Success", description: "Article deleted." });
      fetchPosts();
    } catch {
      toast({ title: "Error", description: "Failed to delete article.", variant: "destructive" });
    }
  };

  const handlePublish = async (post: EditorialPost) => {
    try {
      await adminService.publishEditorialPost(post.id);
      toast({ title: "Published", description: `"${post.title}" is now live.` });
      fetchPosts();
    } catch {
      toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
    }
  };

  const handleUnpublish = async (post: EditorialPost) => {
    try {
      await adminService.unpublishEditorialPost(post.id);
      toast({ title: "Unpublished", description: `"${post.title}" moved to draft.` });
      fetchPosts();
    } catch {
      toast({ title: "Error", description: "Failed to unpublish.", variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingPost) {
      // Create mode: stage the file locally; it will be submitted with the form
      setSelectedImageFile(file);
      setForm((prev) => ({ ...prev, featured_image: file.name }));
      e.target.value = "";
      return;
    }

    // Edit mode: upload immediately
    setIsUploadingImage(true);
    try {
      const res = await adminService.uploadEditorialPostImage(editingPost.id, file);
      const result = (res as any)?.data ?? res;
      const imageUrl = typeof result === 'object' && result !== null && 'featured_image' in result
        ? (result as unknown as { featured_image: string }).featured_image
        : String(result ?? '');
      setForm((prev) => ({ ...prev, featured_image: imageUrl }));
      toast({ title: "Image uploaded", description: "Featured image updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCategorySubmitting(true);
    try {
      await adminService.createEditorialCategory({ name: newCategoryName.trim(), description: newCategoryDesc.trim() || undefined });
      toast({ title: "Success", description: "Category created." });
      setNewCategoryName("");
      setNewCategoryDesc("");
      setIsCategoryDialogOpen(false);
      fetchCategories();
    } catch {
      toast({ title: "Error", description: "Failed to create category.", variant: "destructive" });
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: EditorialCategory) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await adminService.deleteEditorialCategory(cat.id);
      toast({ title: "Success", description: "Category deleted." });
      fetchCategories();
    } catch {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };

  const toggleCategorySelection = (id: number) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editorial Articles</h2>
          <p className="text-muted-foreground">Create, manage and publish editorial posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPosts} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No articles found. Create your first one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[220px] truncate">{post.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {authorName(post.author)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.categories?.map((c) => (
                          <span
                            key={c.id}
                            className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs"
                          >
                            {c.name}
                          </span>
                        )) ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(post.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{post.views_count ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {post.status !== "published" ? (
                            <DropdownMenuItem onClick={() => handlePublish(post)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUnpublish(post)}>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Article" : "New Article"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update the article details below." : "Fill in the details to create a new editorial article."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Short summary shown in listings (max 500 chars)"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Start writing your article..."
                minHeight={400}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: string | null) => setForm({ ...form, status: (v ?? "") as typeof form.status })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time (minutes)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  value={form.read_time_minutes}
                  onChange={(e) => setForm({ ...form, read_time_minutes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              {/* Preview */}
              {form.featured_image && !selectedImageFile && (
                <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.featured_image}
                    alt="Featured"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              {selectedImageFile && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate text-muted-foreground">{selectedImageFile.name}</span>
                  <button
                    type="button"
                    className="ml-auto text-xs text-destructive hover:underline shrink-0"
                    onClick={() => { setSelectedImageFile(null); setForm((p) => ({ ...p, featured_image: "" })); }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {/* Upload button — works for both create and edit */}
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploadingImage ? "Uploading…" : (editingPost ? "Upload image (max 5 MB)" : "Upload image (max 5 MB)")}
                <input type="file" accept="image/*" className="sr-only" disabled={isUploadingImage} onChange={handleImageUpload} />
              </label>
              {/* Or paste a URL */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">or URL:</span>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={selectedImageFile ? "" : form.featured_image}
                  disabled={!!selectedImageFile}
                  onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategorySelection(cat.id)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        form.category_ids.includes(cat.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPost ? "Save Changes" : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>Create or delete editorial categories.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">New Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Mental Health"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Input
                id="cat-desc"
                placeholder="Short description"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              onClick={handleCreateCategory}
              disabled={isCategorySubmitting || !newCategoryName.trim()}
            >
              {isCategorySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-1 h-4 w-4" />
              Add Category
            </Button>

            {categories.length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Existing categories</p>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between py-1">
                    <span className="text-sm">
                      {cat.name}
                      {cat.posts_count !== undefined && (
                        <span className="ml-1 text-xs text-muted-foreground">({cat.posts_count})</span>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(cat)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
