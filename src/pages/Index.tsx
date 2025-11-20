import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet";

const Index = () => {
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
      
      {/* 
        SEMANTIC STRUCTURE:
        - Single <h1> in hero for main heading
        - Section headings use <h2>
        - Subsection headings use <h3>
        - Wrapped in <header>, <main>, <footer> for accessibility and SEO
       */}
      
      {/* Hero Section */}
      <header className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-center">
            I'm Dan Rimada. I will build you a simple website without a subscription.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            I build small, focused websites for people who have real work to do and never wanted to learn a website platform. You tell me what you need, I build it, launch it, and handle small fixes. Most sites are done in under a week. 
          </p>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto italic">
            Not sure you even need a new site? Start with a $50 site checkup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" onClick={() => window.location.href = '/start'} className="shadow-base" aria-label="Start website intake process with AI assistant">
                Talk to the intake AI
              </Button>
              <p className="text-xs text-muted-foreground max-w-[200px] text-center">
                Fast, guided questions that help you figure out what you need.
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
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Or <a href="#pricing" className="text-primary hover:underline">view pricing</a>.
          </p>
        </div>
      </header>

      <main>
        {/* How This Works */}
        <section id="how-it-works" className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">How this works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl font-semibold text-primary">1</div>
                  <h3 className="text-xl font-semibold">You tell me what you need</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    We talk through your project, goals, and content. I'll let you know if this service is a good fit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl font-semibold text-primary">2</div>
                  <h3 className="text-xl font-semibold">I build your site</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    You send me your content (text, images, links, etc.). I ask clarifying questions. I build it, walk you through the final result, and launch it. Most sites launch within 5–7 business days once I have your content.
                  </p>
                </CardContent>
              </Card>
              <Card>
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
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">What you get</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
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

              <Card>
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
        <section id="projects" className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Recent projects
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Here are a few projects I've built or helped shape. Some are client sites, some are my own work. All were built with the same process I use today.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Project 1: RuffLife */}
              <Card>
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
              <Card>
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
              <Card>
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
              <Card>
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

        {/* Who This Is For - Simple website fit check */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">
              Simple website fit check
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">This is a good fit if you:</h3>
                  <ul className="space-y-3">
                    {["Want a simple 5 to 7 page site that looks clean and professional", "Do not want to learn a website platform or deal with a big agency", "Have a real business, practice, or project you are ready to share", "Are fine with straightforward, non fancy design that is clear and easy to read"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">This is not a good fit if you:</h3>
                  <ul className="space-y-3">
                    {["Need ecommerce, online courses, or complex booking systems", "Need a large custom web app or portal", "Want endless rounds of design changes", "Expect a full marketing agency, SEO campaign, or ad management"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-8">About Me</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                I'm Dan Rimada, and I build clear, simple websites for people who have real work to do. I've spent nearly a decade helping people get clear, functional websites without the usual stress or tech learning curve. I've worked with hundreds of small businesses, solo professionals, artists, tour companies, nonprofits, and local service providers. My strength is taking scattered ideas and turning them into calm, readable websites that explain what you do and help people reach you. I keep things simple, fast, and organized so you can focus on your real work. I scope every project honestly and only take on work that fits this simple-build model.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Simple website pricing
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto mb-8">
              Pricing stays simple. Most small websites fall into one of three ranges depending on pages, content readiness, and features.
            </p>
            
            <p className="text-base text-muted-foreground text-center max-w-3xl mx-auto mb-6">
              For exact numbers, you can use the estimator or talk to the intake AI.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Button asChild size="lg">
                <a href="/estimate">Use the guided estimator</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/start">Talk to the intake AI</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mt-8">
              Hosting and your domain are paid directly to your provider (usually around $100–$200 per year). If you want ongoing help after launch, most people choose a simple maintenance arrangement ($50–150 per month depending on needs).
            </p>

            <div className="max-w-2xl mx-auto mt-12 p-6 bg-card border-2 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">$50 Site Checkup</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A quick, practical review of your current site. You get a short written audit covering what's working, what isn't, and the exact fixes I'd recommend. Delivered within 24 hours. No jargon, no upsells.
              </p>
            </div>

            <p className="text-base text-muted-foreground text-center max-w-3xl mx-auto mt-6">
              You have three ways to get pricing clarity:<br />
              • The guided estimator — fast, self-serve estimate using the same pricing I use.<br />
              • The intake AI — describe your project and it will scope it using the unified pricing engine.<br />
              • The contact form — if you prefer to speak with me directly.
            </p>
          </div>
        </section>

        {/* Trust Statement */}
        <div className="py-8 px-4">
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            You will always see a full scoped quote before any work begins.
          </p>
        </div>

        {/* FAQ */}
        <section id="faq" className="py-16 md:py-24 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">Common questions</h2>
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
        <section id="contact" className="py-16 md:py-24 px-4">
          <div className="max-w-2xl mx-auto">
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
