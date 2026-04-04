"use client";

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Save, RefreshCw, Plus, Loader2, Trash2 } from "lucide-react";
import { adminService } from "@/lib/api/admin";

interface LandingPageContent {
  id?: number;
  section: string;
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
}

const SECTIONS = {
  header: "Header",
  hero: "Hero Section",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  footer: "Footer",
  seo: "SEO & Meta",
};

export default function LandingPageContentPage() {
  const [content, setContent] = useState<Record<string, LandingPageContent[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLandingPageContent();
      setContent(typeof data === 'object' && data !== null ? data as Record<string, LandingPageContent[]> : {});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch landing page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string, items: LandingPageContent[]) => {
    try {
      setSaving(true);
      const contentToUpdate = items.map(item => ({
        id: item.id,
        value: item.value,
        metadata: item.metadata,
        is_active: item.is_active,
      }));
      
      await adminService.bulkUpdateLandingPageContent(contentToUpdate);
      toast({
        title: "Success",
        description: `${SECTIONS[section as keyof typeof SECTIONS]} section updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    
    try {
      await adminService.deleteLandingPageContent(id);
      toast({
        title: "Success",
        description: "Content item deleted successfully",
      });
      fetchContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content item",
        variant: "destructive",
      });
    }
  };

  const ContentEditor = ({ section, items }: { section: string; items: LandingPageContent[] }) => {
    const [localItems, setLocalItems] = useState(items);
    const [showAdd, setShowAdd] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [addSaving, setAddSaving] = useState(false);

    useEffect(() => { setLocalItems(items); }, [items]);

    const handleAddNew = async () => {
      if (!newKey.trim()) return;
      setAddSaving(true);
      try {
        await adminService.createLandingPageContent({ section, key: newKey.trim(), value: newValue, is_active: true });
        toast({ title: "Success", description: "Content item created successfully." });
        setShowAdd(false);
        setNewKey("");
        setNewValue("");
        fetchContent();
      } catch {
        toast({ title: "Error", description: "Failed to create content item.", variant: "destructive" });
      } finally {
        setAddSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{SECTIONS[section as keyof typeof SECTIONS]}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveSection(section, localItems)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {localItems.map((item, index) => (
            <Card key={item.id || index}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{item.key}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => {
                        const newItems = [...localItems];
                        newItems[index].is_active = checked;
                        setLocalItems(newItems);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`value-${item.id}`}>Content Value</Label>
                  <Textarea
                    id={`value-${item.id}`}
                    value={item.value || ''}
                    onChange={(e) => {
                      const newItems = [...localItems];
                      newItems[index].value = e.target.value;
                      setLocalItems(newItems);
                    }}
                    rows={3}
                    placeholder="Enter content value..."
                  />
                </div>
                
                {item.metadata && (
                  <div>
                    <Label htmlFor={`metadata-${item.id}`}>Metadata (JSON)</Label>
                    <Textarea
                      id={`metadata-${item.id}`}
                      value={JSON.stringify(item.metadata, null, 2)}
                      onChange={(e) => {
                        try {
                          const metadata = JSON.parse(e.target.value);
                          const newItems = [...localItems];
                          newItems[index].metadata = metadata;
                          setLocalItems(newItems);
                        } catch (error) {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={2}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => item.id && handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Content Item — {SECTIONS[section as keyof typeof SECTIONS]}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Key <span className="text-muted-foreground text-xs">(e.g. headline, subtext)</span></Label>
                <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="content_key" />
              </div>
              <div className="space-y-1">
                <Label>Value</Label>
                <Textarea rows={3} value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Content value…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAddNew} disabled={addSaving || !newKey.trim()}>
                {addSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landing Page Content</h1>
          <p className="text-muted-foreground">
            Manage the content displayed on your landing page
          </p>
        </div>
        <Button variant="outline" onClick={fetchContent}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-9">
          {Object.entries(SECTIONS).map(([key]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {SECTIONS[key as keyof typeof SECTIONS]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(SECTIONS).map(([key]) => (
          <TabsContent key={key} value={key}>
            <ContentEditor
              section={key}
              items={content[key] || []}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
