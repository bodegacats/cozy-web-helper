import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string | null;
  featured_image_url: string | null;
  published_at: string;
  meta_title: string;
  meta_description: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.meta_title}</title>
        <meta name="description" content={post.meta_description} />
        <meta property="og:title" content={post.meta_title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:type" content="article" />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        <link rel="canonical" href={`https://yourdomain.com/blog/${post.slug}`} />
      </Helmet>

      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto px-6 py-20">
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </time>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          </header>

          {post.featured_image_url && (
            <div className="mb-12 rounded-lg overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <footer className="mt-16 pt-8 border-t">
            <Button onClick={() => navigate("/blog")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </footer>
        </article>
      </main>
    </>
  );
}
