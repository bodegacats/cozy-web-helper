import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { getCategoryStyles } from "@/components/blog/getCategoryStyles";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  featured_image_url: string | null;
  published_at: string;
  meta_description: string;
}

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, category, featured_image_url, published_at, meta_description")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog - Web Design & Development Insights | Build Me a Simple Site</title>
        <meta name="title" content="Blog - Web Design & Development Insights | Build Me a Simple Site" />
        <meta
          name="description"
          content="Expert insights on web design, development, SEO, and digital strategy. Learn best practices and stay updated with the latest trends."
        />
        <meta name="keywords" content="web design blog, web development, SEO tips, digital strategy, website best practices, web design insights" />
        <link rel="canonical" href="https://buildmeasimplesite.com/blog" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buildmeasimplesite.com/blog" />
        <meta property="og:site_name" content="Build Me a Simple Site" />
        <meta property="og:title" content="Blog - Web Design & Development Insights | Build Me a Simple Site" />
        <meta property="og:description" content="Expert insights on web design, development, SEO, and digital strategy. Learn best practices and stay updated with the latest trends." />
        <meta property="og:image" content="https://buildmeasimplesite.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://buildmeasimplesite.com/og-image.jpg" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://buildmeasimplesite.com/blog" />
        <meta name="twitter:title" content="Blog - Web Design & Development Insights | Build Me a Simple Site" />
        <meta name="twitter:description" content="Expert insights on web design, development, SEO, and digital strategy. Learn best practices and stay updated with the latest trends." />
        <meta name="twitter:image" content="https://buildmeasimplesite.com/og-image.jpg" />
        <meta name="twitter:creator" content="@buildmeasimple" />
        <meta name="twitter:site" content="@buildmeasimple" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Blog - Web Design & Development Insights",
            "description": "Expert insights on web design, development, SEO, and digital strategy.",
            "url": "https://buildmeasimplesite.com/blog",
            "isPartOf": {
              "@id": "https://buildmeasimplesite.com/#website"
            },
            "breadcrumb": {
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
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section with Gradient */}
        <section className="relative overflow-hidden bg-gradient-hero py-24 px-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
          <div className="relative max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-8 bg-background/50 hover:bg-background/80 backdrop-blur-sm"
              aria-label="Return to homepage"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Blog
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Insights, tips, and best practices for web design and development
              </p>
            </div>
          </div>
        </section>

        {/* Posts Section */}
        <section className="py-20 px-6 -mt-12">
          <div className="max-w-6xl mx-auto">

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-t-4">
                    <div className="animate-pulse">
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50" />
                      <div className="p-6 space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4 animate-shimmer" />
                        <div className="h-3 bg-muted rounded animate-shimmer" />
                        <div className="h-3 bg-muted rounded w-5/6 animate-shimmer" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for new content!
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => {
                  const styles = getCategoryStyles(post.category);
                  const estimatedReadTime = Math.max(1, Math.ceil(post.excerpt.split(' ').length / 200 * 5));
                  
                  return (
                    <Card 
                      key={post.id} 
                      className={`overflow-hidden cursor-pointer group border-t-4 ${styles.borderClass} ${styles.shadowClass} transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      {post.featured_image_url && (
                        <div className="aspect-video overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            width="800"
                            height="450"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {post.category && (
                            <Badge className={`${styles.badgeClass} border`}>
                              {post.category}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimatedReadTime} min read
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                          {new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <Button variant="ghost" className="p-0 h-auto font-semibold text-primary group/btn">
                          Read more
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
