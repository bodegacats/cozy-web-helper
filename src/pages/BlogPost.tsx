import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getCategoryStyles } from "@/components/blog/getCategoryStyles";
import { marked } from 'marked';

// Configure marked for good defaults
marked.setOptions({
  breaks: true,
  gfm: true
});

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

          <div className="bg-card rounded-2xl p-8 md:p-12 border shadow-soft-xl">
            <div 
              className="
                prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-primary/20
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-foreground
                prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-foreground
                prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.125rem]
                prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:border-b-2 prose-a:border-primary/30 hover:prose-a:border-primary prose-a:transition-all prose-a:pb-0.5
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground/80 prose-em:italic
                prose-ul:my-8 prose-ul:space-y-3
                prose-ol:my-8 prose-ol:space-y-3
                prose-li:text-foreground/90 prose-li:leading-relaxed prose-li:text-[1.0625rem]
                prose-li::marker:text-primary prose-li::marker:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:rounded-r-lg
                prose-blockquote:text-foreground/80
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-6 prose-pre:my-8 prose-pre:overflow-x-auto
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full
                prose-hr:border-border prose-hr:my-12
                first:prose-p:text-xl first:prose-p:leading-relaxed first:prose-p:text-foreground
              "
              dangerouslySetInnerHTML={{ 
                __html: marked(stripLeadingTitle(post.content, post.title))
              }}
            />
          </div>

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
