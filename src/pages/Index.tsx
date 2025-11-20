import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [pageCount, setPageCount] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });

  const calculatePrice = (pages: number): number => {
    if (pages === 1) return 500;
    if (pages >= 2 && pages <= 4) return 1000;
    if (pages >= 5 && pages <= 7) return 1500;
    return 1500; // max
  };

  const currentPrice = calculatePrice(pageCount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        wish: "Instant quote",
        project_description: "Instant quote submission",
        selected_options: { pageCount },
        estimate_low: currentPrice,
        estimate_high: currentPrice,
        notes: formData.notes.trim() || null,
        status: "new"
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("Estimate sent successfully!");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setFormData({ name: '', email: '', notes: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting estimate:', error);
      toast.error("Failed to submit estimate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How long does it usually take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Once I have your content (text, images, links), most sites launch within a week. Some take a bit longer depending on how much back and forth we need. If you are slow to send materials or give feedback, that adds time."
                }
              },
              {
                "@type": "Question",
                "name": "What if I don't have content ready?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "I can help organize and edit what you have, but I don't write copy from scratch. You provide the words, I make them clear and place them well."
                }
              },
              {
                "@type": "Question",
                "name": "Can I update the site myself later?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. I build on platforms that let you log in and change text or images without touching code. I show you how everything works before we launch."
                }
              },
              {
                "@type": "Question",
                "name": "What platform do you use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "I use whatever makes sense for your project (usually Webflow, Wix, or WordPress). You own the site and login credentials."
                }
              },
              {
                "@type": "Question",
                "name": "What happens after launch?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The site is yours. You can update it yourself or ask me for help. Small fixes (broken link, typo, image swap) are included for the first 30 days. After that, I charge hourly for updates."
                }
              },
              {
                "@type": "Question",
                "name": "What if my project is bigger than this?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "If you need something more complex (custom features, integrations, or ongoing work), I'll tell you upfront and we can talk through other options or I can refer you to someone better suited."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <Navbar />
      
      {/* Hero Section */}
      <header className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-center">
            I will build you a simple website without a subscription.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            No WordPress subscriptions, no monthly fees to pay a platform. I build it, hand you the keys, 
            and you're done — unless you need updates later (then you just ask). Most sites launch in 5–7 business days.
          </p>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto italic">
            Not sure you even need a new site? Get a <strong>$50 site checkup</strong> — a quick, practical review of your current website. I'll send you a short written audit covering what's working, what isn't, and what I'd change. Clear, actionable, no jargon. <a href="#contact" className="text-primary hover:underline">Contact me to get started.</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" onClick={() => window.location.href = '/start'} className="shadow-base" aria-label="Start website intake process with AI assistant">
                Talk to the intake AI
              </Button>
              <p className="text-xs text-muted-foreground max-w-[200px] text-center">
                Quick questions. Helps you figure out what you need.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" variant="outline" onClick={scrollToContact} className="border-2" aria-label="Scroll to contact form to discuss your website">
                Talk to me directly
              </Button>
              <p className="text-xs text-muted-foreground max-w-[200px] text-center">
                If you prefer human-first help.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* How This Works */}
        <section id="how-it-works" className="py-20 md:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-16">How This Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl font-semibold text-primary">1</div>
                  <h3 className="text-xl font-semibold">You tell me what you need</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    We talk through your project, goals, and content. I'll let you know if this service is a good fit.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl font-semibold text-primary">2</div>
                  <h3 className="text-xl font-semibold">I build your site</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    You send me your content (text, images, links, etc.). I ask clarifying questions. I build it, walk you through the final result, and launch it. Most sites launch within 5–7 business days once I have your content.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl font-semibold text-primary">3</div>
                  <h3 className="text-xl font-semibold">Your site goes live</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    I launch your site, show you how to update it, and make sure everything works smoothly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-16">What You Get</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Included in every site</h3>
                  <ul className="space-y-3">
                    {["Most sites end up between 4 and 7 pages (Home, About, Services or Work, Contact, plus anything else you truly need).", "Mobile-friendly responsive design", "Fast loading and clean code", "Basic SEO setup", "Contact form that works", "Simple, clear navigation", "Instructions for making updates"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Types of sites this works for</h3>
                  <ul className="space-y-3">
                    {["Service businesses (consultants, therapists, contractors)", "Portfolios (artists, photographers, writers)", "Nonprofits and community organizations", "Creative projects (films, books, events)", "Solo professionals (coaches, educators, speakers)", "Small retail or local businesses (no ecommerce)"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Projects */}
        <section id="projects" className="py-20 md:py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Recent Projects
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Here are a few projects I've built or helped shape. Some are client sites, some are my own work — all built with the same process I use today.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Project 1: RuffLife */}
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src="https://i.imgur.com/7rAmj6S.jpeg" alt="Dog walking and pet sitting small business website in Jersey City" className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" width="800" height="450" aria-label="View full screenshot of RuffLife website" />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img src="https://i.imgur.com/K49QVdg.jpeg" alt="Dog walking and pet sitting small business website in Jersey City" className="w-full h-auto" width="1200" height="2400" />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">RuffLife: Jersey City</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Dog walking and pet sitting service in Jersey City.
                  </p>
                  <p className="text-sm leading-relaxed">
                    The owner had no website and was losing leads to competitors who showed up in Google. Built a 4-page site focused on trust signals and local proof. Calls went up 40% in the first month.
                  </p>
                  <a href="https://rufflifejc.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-primary hover:underline">
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 2: Cats About Town Tours */}
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src="https://i.imgur.com/vuJkqLu.jpeg" alt="NYC walking tour website for Cats About Town Tours" className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" width="800" height="450" aria-label="View full screenshot of Cats About Town Tours website" />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img src="https://i.imgur.com/hJGImR8.jpeg" alt="NYC walking tour website for Cats About Town Tours" className="w-full h-auto" width="1200" height="2400" />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Cats About Town Tours</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    NYC walking tours with a cat-history twist.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Needed a site that explained each tour clearly, highlighted press coverage, and drove bookings through FareHarbor. Site launched on deadline before a major media hit. Bookings doubled.
                  </p>
                  <a href="https://catsabouttowntours.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-primary hover:underline">
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 3: Bodega Cats of New York */}
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src="https://i.imgur.com/9Kcx0Dp.jpeg" alt="Advocacy and storytelling website for New York bodega cats" className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" width="800" height="450" aria-label="View full screenshot of Bodega Cats of New York website" />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img src="https://i.imgur.com/hOL1GCg.jpeg" alt="Advocacy and storytelling website for New York bodega cats" className="w-full h-auto" width="1200" height="2400" />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Bodega Cats of New York</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Advocacy, stories, and community around NYC's shop cats.
                  </p>
                  <p className="text-sm leading-relaxed">
                    The project had scattered content across social media with no central hub. Built a home for blog posts, press coverage, and clear calls to action for following and supporting the project.
                  </p>
                  <a href="https://bodegacatsofnewyork.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-primary hover:underline">
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 4: Pencils & Pecs */}
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src="https://i.imgur.com/HptFEBB.jpeg" alt="Pop up life drawing event website for Pencils & Pecs" className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" width="800" height="450" aria-label="View full screenshot of Pencils & Pecs website" />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img src="https://i.imgur.com/4dLGWQt.jpeg" alt="Pop up life drawing event website for Pencils & Pecs" className="w-full h-auto" width="1200" height="2400" />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Pencils & Pecs</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Pop-up life drawing experience for events and celebrations.
                  </p>
                  <p className="text-sm leading-relaxed">
                    New business needed to book private events and venue partnerships fast. Built a 3-page site that explained the concept quickly and drove inquiries. First event booked within two weeks of launch.
                  </p>
                  <a href="http://pencilsandpecs.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-primary hover:underline">
                    View site →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Simple Website Fit Check */}
        <section className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">
              Simple Website Fit Check
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">✅ Good fit if you...</h3>
                  <ul className="space-y-3">
                    {["Have clear content or can provide it", "Need a professional, working site—not a marketing masterpiece", "Want something that loads fast and works on phones", "Don't want to learn WordPress, Squarespace, or Webflow", "Need ~1–7 pages (most common: 3–5)"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">❌ Not a fit if you...</h3>
                  <ul className="space-y-3">
                    {["Need e-commerce (Shopify is better)", "Want a membership site or complex user logins", "Need heavy custom integrations or APIs", "Want to edit content yourself constantly (then use a CMS)", "Need 20+ pages or a content-heavy blog"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Still not sure? The AI intake can help you decide.
              </p>
              <Button asChild size="lg">
                <a href="/start">Start the intake conversation</a>
              </Button>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">About Me</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              I build simple, clear websites for people who have real work to do and never wanted to learn a website platform. 
              You tell me what you need, I build it, launch it, and handle small fixes afterward. Most sites launch in 5–7 business days once I have your content.
            </p>
          </div>
        </section>

        {/* Instant Quote */}
        <section id="pricing" className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Instant Quote
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Your instant price based on how many pages you need.
            </p>
            
            <div className="bg-card border-2 rounded-lg p-8 md:p-12 space-y-8 shadow-lg">
              {/* Slider Section */}
              <div className="space-y-6">
                <label className="block text-lg font-medium text-center">
                  How many pages do you need?
                </label>
                
                <div className="space-y-4">
                  <Slider
                    value={[pageCount]}
                    onValueChange={(value) => setPageCount(value[0])}
                    min={1}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 page</span>
                    <span className="font-semibold text-foreground text-base">{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                    <span>7 pages</span>
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="text-center py-6">
                <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                  ${currentPrice.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Price updates instantly based on the number of pages.
                </p>
              </div>

              {/* Included List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">What's included:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li>• Clean, simple, mobile-ready design</li>
                  <li>• Hosting</li>
                  <li>• Security</li>
                  <li>• Easy editing tools</li>
                  <li>• Fast performance</li>
                  <li>• Two rounds of revisions</li>
                  <li>• Guidance on best practices</li>
                  <li>• Launch support</li>
                </ul>
              </div>

              {/* Content Note */}
              <p className="text-sm text-muted-foreground text-center pt-4 border-t">
                You provide the words and images. I handle the build.
              </p>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Send me this estimate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    {!isSuccess ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>Send me this estimate</DialogTitle>
                          <DialogDescription>
                            I'll review this and get back to you within one business day.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2 pb-4 border-b">
                            <p className="text-sm font-medium">
                              Estimated price: <span className="text-2xl font-bold text-primary">${currentPrice}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Based on {pageCount} page{pageCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name *</Label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Your name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="your@email.com"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes about your project (optional)</Label>
                              <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Any additional details..."
                                rows={3}
                              />
                            </div>
                            
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? "Sending..." : "Send Estimate"}
                            </Button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center space-y-4">
                        <DialogHeader>
                          <DialogTitle>Thanks!</DialogTitle>
                          <DialogDescription>
                            I'll review your estimate and reply within one business day.
                          </DialogDescription>
                        </DialogHeader>
                        <Button onClick={() => setIsModalOpen(false)} variant="outline">
                          Close
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <div className="text-center">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className="text-sm"
                  >
                    <button onClick={() => {
                      const element = document.getElementById('pricing');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>
                      View pricing details
                    </button>
                  </Button>
                </div>
              </div>
            </div>

            {/* Maintenance Note */}
            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              If you want ongoing help after launch, most people choose a simple monthly maintenance arrangement ($50–150/month) depending on how much support they need.
            </p>
          </div>
        </section>

        {/* Pricing Details - How It Works */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center">
              How Pricing Works
            </h2>
            
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <div className="bg-card border-2 rounded-lg p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Simple, Tiered Pricing</h3>
                  <ul className="space-y-2 text-base">
                    <li>• <strong>1 page:</strong> $500</li>
                    <li>• <strong>2-4 pages:</strong> $1,000</li>
                    <li>• <strong>5-7 pages:</strong> $1,500</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-xl font-semibold text-foreground mb-3">What's Always Included</h3>
                  <ul className="space-y-2 text-base">
                    <li>• Clean, simple, mobile-ready design</li>
                    <li>• Hosting</li>
                    <li>• Security</li>
                    <li>• Easy editing tools</li>
                    <li>• Fast performance</li>
                    <li>• Two rounds of revisions</li>
                    <li>• Guidance on best practices</li>
                    <li>• Launch support</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground italic">
                    You provide the words and images. I handle the build.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">How long does it take?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  Most sites launch within 5–7 business days once I have your content (text, images, links). Some take a bit longer depending on how much back and forth we need. If you are slow to send materials or give feedback, that adds time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What if I don't have content ready?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  I can help organize and edit what you have, but I don't write copy from scratch. You provide the words, I make them clear and place them well.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">Can I update the site myself later?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  Yes. I build on platforms that let you log in and change text or images without touching code. I show you how everything works before we launch.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What platform do you use?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  I use whatever makes sense for your project (usually Webflow, Wix, or WordPress). You own the site and login credentials.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What happens after launch?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  The site is yours. You can update it yourself or ask me for help. Small fixes (broken link, typo, image swap) are included for the first 30 days. After that, I charge hourly for updates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What if my project is bigger than this?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  If you need something more complex (custom features, integrations, or ongoing work), I'll tell you upfront and we can talk through other options or I can refer you to someone better suited.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">
              Get In Touch
            </h2>
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Build Me a Simple Site. All rights reserved.</p>
          <p className="mt-2">
            <a href="/portal" className="text-primary hover:underline">Client Portal</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;