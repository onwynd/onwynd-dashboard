"use client";
import { useEffect, useMemo, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UploadCloud, FolderOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SoundFile = {
  name: string;
  size: number;
  url: string;
  category: string;
  timestamp?: number;
};

type SoundResponse = {
  data: SoundFile[];
  categories: string[];
  category?: string;
};

export default function AdminSoundsPage() {
  const [sounds, setSounds] = useState<SoundFile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (category: string): Promise<string> => {
    setLoading(true);
    try {
      const res = await adminService.getSounds(category || undefined);
      const data = Array.isArray(res) ? res : (res as SoundResponse).data ?? [];
      const cats = Array.isArray(res) ? [] : (res as SoundResponse).categories ?? [];
      const resolved = (res as SoundResponse).category ?? cats[0] ?? category;
      setSounds(data);
      if (cats.length) setCategories(cats);
      return resolved;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load — API auto-picks first real category from storage
    load('').then((resolved) => setSelectedCategory(resolved));
  }, []);

  const totalSize = useMemo(() => sounds.reduce((a, b) => a + (b.size || 0), 0), [sounds]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await adminService.uploadSound(file, selectedCategory);
      await load(selectedCategory);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDelete = async (name: string) => {
    await adminService.deleteSound(name, selectedCategory);
    await load(selectedCategory);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Audio Library</CardTitle>
            <CardDescription>Manage audio files stored in storage/app/public/sounds</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={(value: string | null) => { const v = value ?? selectedCategory; setSelectedCategory(v); load(v); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label htmlFor="sound-upload" className="inline-flex items-center">
              <Input id="sound-upload" type="file" accept="audio/*" className="hidden" onChange={onUpload} />
              <Button disabled={uploading}>
                <UploadCloud className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Files: {sounds.length} • Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-32">Size</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4}>Loading...</TableCell>
                  </TableRow>
                ) : sounds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>No audio files found.</TableCell>
                  </TableRow>
                ) : (
                  sounds.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell>
                        <audio controls preload="none" src={s.url} className="max-w-[200px]" />
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{(s.size / 1024).toFixed(1)} KB</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="destructive" onClick={() => onDelete(s.name)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
  );
}
