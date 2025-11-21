import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { markdownToHtml } from "@/lib/markdown-utils";

export default function AdminBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== "new";

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    category: "",
    tags: [] as string[],
    meta_title: "",
    meta_description: "",
    published: false,
  });

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const tags = Array.isArray(data.tags) 
        ? data.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];
      
      setFormData({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image_url: data.featured_image_url || "",
        category: data.category || "",
        tags,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        published: data.published,
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
      navigate("/admin/blog");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      fetchPost();
    }
  }, [isEditing, id, fetchPost]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert(postData);

        if (error) throw error;
        toast.success("Post created successfully");
      }

      navigate("/admin/blog");
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/blog")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Post" : "New Post"}
            </h1>
          </div>
          <div className="flex gap-3">
            {formData.published && formData.slug && (
              <Button
                variant="outline"
                onClick={() => window.open(`/blog/${formData.slug}`, "_blank")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL: /blog/{formData.slug || "your-slug"}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description (shown in post lists)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Web Design, SEO"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Label className="mb-4 block">Content * (Markdown)</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content in Markdown..."
                  className="min-h-[400px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div 
                  className="min-h-[400px] p-4 border rounded-lg prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.content) }}
                />
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title *</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO title (60 chars max)"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.meta_title.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description *</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description (160 chars max)"
                  maxLength={160}
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
