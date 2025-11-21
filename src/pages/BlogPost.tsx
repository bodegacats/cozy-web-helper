import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getCategoryStyles } from "@/components/blog/getCategoryStyles";

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

  const styles = getCategoryStyles(post.category);
  const estimatedReadTime = Math.max(1, Math.ceil(post.content.split(' ').length / 200));

  return (
    <>
      <Helmet>
        <title>{post.meta_title}</title>
        <meta name="title" content={post.meta_title} />
        <meta name="description" content={post.meta_description} />
        <link rel="canonical" href={`https://buildmeasimplesite.com/blog/${post.slug}`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Dan Mulé" />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://buildmeasimplesite.com/blog/${post.slug}`} />
        <meta property="og:site_name" content="Build Me a Simple Site" />
        <meta property="og:title" content={post.meta_title} />
        <meta property="og:description" content={post.meta_description} />
        {post.featured_image_url && (
          <>
            <meta property="og:image" content={post.featured_image_url} />
            <meta property="og:image:secure_url" content={post.featured_image_url} />
            <meta property="og:image:alt" content={post.title} />
          </>
        )}
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content="Dan Mulé" />
        {post.category && <meta property="article:section" content={post.category} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://buildmeasimplesite.com/blog/${post.slug}`} />
        <meta name="twitter:title" content={post.meta_title} />
        <meta name="twitter:description" content={post.meta_description} />
        {post.featured_image_url && (
          <>
            <meta name="twitter:image" content={post.featured_image_url} />
            <meta name="twitter:image:alt" content={post.title} />
          </>
        )}
        <meta name="twitter:creator" content="@buildmeasimple" />
        <meta name="twitter:site" content="@buildmeasimple" />
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
        {/* Hero Section */}
        {post.featured_image_url && post.featured_image_url.trim() !== '' && (
          <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
                width="1920"
                height="1080"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}

        <article className="max-w-4xl mx-auto px-6 pb-20" style={{ marginTop: post.featured_image_url ? '-8rem' : '5rem' }}>
          <div className="relative">
            <Button
              variant="ghost"
              className="mb-8 bg-background/80 hover:bg-background backdrop-blur-sm"
              onClick={() => navigate("/blog")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>

            <header className="mb-12 bg-background/95 backdrop-blur-sm rounded-2xl p-8 border-2 border-border shadow-soft-xl">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {post.category && (
                  <Badge className={`${styles.badgeClass} border`}>
                    {post.category}
                  </Badge>
                )}
                <div className="flex items-center text-muted-foreground text-sm gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </time>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {estimatedReadTime} min read
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{post.title}</h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </header>
          </div>

          <div 
            className="prose prose-lg prose-slate dark:prose-invert max-w-none mx-auto
    prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-mt-20
    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-3 prose-h2:border-border
    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
    prose-a:text-primary prose-a:font-medium hover:prose-a:underline prose-a:transition-colors
    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
    prose-li:mb-2 prose-li:leading-relaxed
    prose-strong:text-foreground prose-strong:font-semibold
    prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
    first:prose-p:first-letter:text-5xl first:prose-p:first-letter:font-bold first:prose-p:first-letter:mr-1 first:prose-p:first-letter:float-left"
            dangerouslySetInnerHTML={{ 
              __html: stripLeadingTitle(post.content, post.title)
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/\n/gim, '<br />')
            }}
          />

          <footer className="mt-20 pt-12 border-t-2 border-border">
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => navigate("/blog")}
                size="lg"
                className="group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Button>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}
