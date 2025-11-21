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

const stripLeadingTitle = (markdown: string, title: string): string => {
  const lines = markdown.split('\n');
  let firstNonEmptyIndex = 0;
  
  // Find first non-empty line
  while (firstNonEmptyIndex < lines.length && !lines[firstNonEmptyIndex].trim()) {
    firstNonEmptyIndex++;
  }
  
  if (firstNonEmptyIndex >= lines.length) return markdown;
  
  const firstLine = lines[firstNonEmptyIndex].trim();
  
  // Check if first line is an H1 that matches the title
  if (firstLine.startsWith('# ')) {
    const h1Text = firstLine.substring(2).trim();
    if (h1Text.toLowerCase() === title.toLowerCase()) {
      // Remove this line and any following empty lines
      let nextContentIndex = firstNonEmptyIndex + 1;
      while (nextContentIndex < lines.length && !lines[nextContentIndex].trim()) {
        nextContentIndex++;
      }
      return lines.slice(nextContentIndex).join('\n');
    }
  }
  
  return markdown;
};

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
        <link rel="canonical" href={`https://buildmeasimplesite.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.meta_title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://buildmeasimplesite.com/blog/${post.slug}`} />
        <meta property="og:site_name" content="Build Me a Simple Site" />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content="Dan Mulé" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title} />
        <meta name="twitter:description" content={post.meta_description} />
        {post.featured_image_url && (
          <meta name="twitter:image" content={post.featured_image_url} />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.featured_image_url,
            "datePublished": post.published_at,
            "dateModified": post.published_at,
            "author": {
              "@type": "Person",
              "name": "Dan Mulé"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Build Me a Simple Site",
              "url": "https://buildmeasimplesite.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://buildmeasimplesite.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://buildmeasimplesite.com/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://buildmeasimplesite.com/blog/${post.slug}`
              }
            ]
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-6 py-20">
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

          {post.featured_image_url && post.featured_image_url.trim() !== '' && (
            <div className="mb-12 rounded-lg overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
                width="1200"
                height="675"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="prose prose-lg max-w-prose mx-auto
            prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
            prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
            prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-foreground prose-li:mb-2
            prose-img:rounded-lg prose-img:shadow-md
            prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic">
            <ReactMarkdown>{stripLeadingTitle(post.content, post.title)}</ReactMarkdown>
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
