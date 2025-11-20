import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Index = () => {
  const [checklistAnswers, setChecklistAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const checklistQuestions = [
    { id: 1, text: "Do you need just 1-8 pages?" },
    { id: 2, text: "Do you need a clean, professional site (not cutting-edge design)?" },
    { id: 3, text: "Will a contact form and basic features cover your needs?" },
    { id: 4, text: "Do you want one person (not a team) handling your entire project from start to finish?" },
    { id: 5, text: "Do you want to avoid learning new tools or platforms?" },
    { id: 6, text: "Can your project wait about a week for delivery?" },
    { id: 7, text: "Do you have a budget of $500–$1,500?" },
  ];

  const handleChecklistSubmit = () => {
    setShowResult(true);
    const resultElement = document.getElementById('checklist-result');
    resultElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const yesCount = Object.values(checklistAnswers).filter(a => a === "yes").length;
  const noCount = Object.values(checklistAnswers).filter(a => a === "no").length;

  const getResultMessage = () => {
    if (yesCount >= 5) {
      return {
        title: "If you said yes to most questions",
        message: "This service is probably a strong match. You want a clear, honest site, built by one person, without a long process. That is exactly what I do.",
        cta: true
      };
    } else if (yesCount >= 3) {
      return {
        title: "If you had a mix of yes and no",
        message: "You might still be a good fit. It just means we should talk through your project and see what makes sense. Some things we can keep simple. Some things might need a different plan.",
        cta: true
      };
    } else {
      return {
        title: "If you said no to most questions",
        message: "You may need a bigger team, a fully custom build, or a different type of website. If you want to share what you are working on, I am happy to point you toward a better option, even if that is not me.",
        cta: false
      };
    }
  };

  const scrollToChecklist = () => {
    const element = document.getElementById('checklist');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const result = showResult ? getResultMessage() : null;

  return (
    <div className="min-h-screen bg-background">
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
          <p className="text-sm md:text-base font-medium text-primary uppercase tracking-wide">
            One person website service
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Get a website built in a week. No learning curve.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            I build small, focused websites for people who have real work to do and never wanted to learn a website platform. You tell me what you need, I build it, launch it, and handle small fixes. Most sites are done in under a week. Pricing is flat: $500–$1,500 depending on scope.
          </p>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto italic">
            Not sure you even need a new site? Start with a $50 site checkup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={scrollToChecklist} className="shadow-base">
              Take the 7 question checklist
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToContact} className="border-2">
              Talk to me about your site
            </Button>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Not sure you even need a new site? You can start with a $50 site checkup further down this page.
          </p>
        </div>
      </header>

      <main>
        {/* How This Works */}
        <section className="py-16 md:py-24 px-4">
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
                    You send me your content (text, images, links, etc.). I ask clarifying questions. I build it, walk you through the final result, and launch it. Once I have what I need from you, most sites launch within a week.
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

        {/* Checklist Section */}
        <section id="checklist" className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-3 mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">Simple website fit check</h2>
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                These questions are not a test. They just help us see if this service matches what you need. Pick yes or no for each one.
              </p>
            </div>

            <Card className="shadow-lg border-2">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {checklistQuestions.map((question, index) => (
                    <div 
                      key={question.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-accent/50 transition-colors"
                    >
                      <p className="text-base leading-relaxed font-medium mb-3">{question.text}</p>
                      <RadioGroup
                        value={checklistAnswers[question.id]}
                        onValueChange={(value) => {
                          setChecklistAnswers(prev => ({ ...prev, [question.id]: value }));
                          setShowResult(false);
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`q${question.id}-yes`} />
                          <Label htmlFor={`q${question.id}-yes`} className="cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`q${question.id}-no`} />
                          <Label htmlFor={`q${question.id}-no`} className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleChecklistSubmit}
                  disabled={Object.keys(checklistAnswers).length < 7}
                  className="w-full mt-6"
                  size="lg"
                >
                  See my result
                </Button>

                {showResult && result && (
                  <div 
                    id="checklist-result"
                    className="mt-8 p-6 rounded-xl bg-primary/5 border-2 border-primary/20 animate-fadeInUp"
                  >
                    <h3 className="text-xl font-semibold mb-3">{result.title}</h3>
                    <p className="text-base leading-relaxed mb-4">{result.message}</p>
                    {result.cta && (
                      <Button onClick={scrollToContact} size="lg">
                        Talk to me about my site
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Simple Site Checkup */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
              Not sure if you even need a new site?
            </h2>
            
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-muted-foreground">
                If you are on the fence about a full rebuild, you do not have to guess. Start with a $50 Simple Site Checkup.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                I record a 5–7 minute personal video walkthrough of your current website, point out 3–5 concrete things you can fix yourself, and give you my honest take on whether you should keep what you have, use a cheaper DIY option, or have me rebuild it.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                If you hire me for a new site within 30 days, I put the $50 toward your project fee.
              </p>
            </div>

            <Card className="shadow-lg border-2">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-semibold">$50 Simple Site Checkup</h3>

                <Button size="lg" onClick={scrollToContact}>
                  Get a $50 site checkup
                </Button>

                <p className="text-sm text-muted-foreground">
                  When you write to me, just mention "checkup" so I know you want the $50 video review.
                </p>
              </CardContent>
            </Card>
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
                    {[
                      "Most sites end up between 4 and 7 pages (Home, About, Services or Work, Contact, plus anything else you truly need).",
                      "Mobile-friendly responsive design",
                      "Fast loading and clean code",
                      "Basic SEO setup",
                      "Contact form that works",
                      "Simple, clear navigation",
                      "Instructions for making updates"
                    ].map((item, i) => (
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
                    {[
                      "Service businesses (consultants, therapists, contractors)",
                      "Portfolios (artists, photographers, writers)",
                      "Nonprofits and community organizations",
                      "Creative projects (films, books, events)",
                      "Solo professionals (coaches, educators, speakers)",
                      "Small retail or local businesses (no ecommerce)"
                    ].map((item, i) => (
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
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Recent projects
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Here are a few websites I've designed and helped shape. Each one is simple, clear, and built around what the client actually needed their site to do.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Project 1: RuffLife */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img 
                        src="https://i.imgur.com/7rAmj6S.jpeg" 
                        alt="RuffLife Jersey City website hero" 
                        className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" 
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img 
                        src="https://i.imgur.com/K49QVdg.jpeg" 
                        alt="RuffLife Jersey City full page screenshot" 
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">RuffLife: Jersey City</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Dog walking and pet sitting service in Jersey City.
                  </p>
                  <p className="text-sm leading-relaxed">
                    The owner had no website and was losing leads to competitors who showed up in Google. Built a 4-page site focused on trust signals and local proof. Calls went up 40% in the first month.
                  </p>
                  <a 
                    href="https://rufflifejc.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 2: Cats About Town Tours */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img 
                        src="https://i.imgur.com/vuJkqLu.jpeg" 
                        alt="Cats About Town Tours website hero" 
                        className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" 
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img 
                        src="https://i.imgur.com/hJGImR8.jpeg" 
                        alt="Cats About Town Tours full page screenshot" 
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Cats About Town Tours</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    NYC walking tours with a cat-history twist.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Needed a site that explained each tour clearly, highlighted press coverage, and drove bookings through FareHarbor. Site launched on deadline before a major media hit. Bookings doubled.
                  </p>
                  <a 
                    href="https://catsabouttowntours.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 3: Bodega Cats of New York */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img 
                        src="https://i.imgur.com/9Kcx0Dp.jpeg" 
                        alt="Bodega Cats of New York website hero" 
                        className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" 
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img 
                        src="https://i.imgur.com/hOL1GCg.jpeg" 
                        alt="Bodega Cats of New York full page screenshot" 
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Bodega Cats of New York</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Advocacy, stories, and community around NYC's shop cats.
                  </p>
                  <p className="text-sm leading-relaxed">
                    The project had scattered content across social media with no central hub. Built a home for blog posts, press coverage, and clear calls to action for following and supporting the project.
                  </p>
                  <a 
                    href="https://bodegacatsofnewyork.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    View site →
                  </a>
                </CardContent>
              </Card>

              {/* Project 4: Pencils & Pecs */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img 
                        src="https://i.imgur.com/HptFEBB.jpeg" 
                        alt="Pencils & Pecs website hero" 
                        className="w-full h-56 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" 
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <img 
                        src="https://i.imgur.com/4dLGWQt.jpeg" 
                        alt="Pencils & Pecs full page screenshot" 
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                  <h3 className="text-xl font-semibold">Pencils & Pecs</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Pop-up life drawing experience for events and celebrations.
                  </p>
                  <p className="text-sm leading-relaxed">
                    New business needed to book private events and venue partnerships fast. Built a 3-page site that explained the concept quickly and drove inquiries. First event booked within two weeks of launch.
                  </p>
                  <a 
                    href="http://pencilsandpecs.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    View site →
                  </a>
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
                I've spent nearly a decade helping people get clear, functional websites without the usual stress or tech learning curve. I've worked with hundreds of small businesses, solo professionals, artists, tour companies, nonprofits, and local service providers. My strength is taking scattered ideas and turning them into calm, readable websites that explain what you do and help people reach you. I keep things simple, fast, and organized so you can focus on your real work.
              </p>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">
              Who this is for (and not for)
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">This is a good fit if you:</h3>
                  <ul className="space-y-3">
                    {[
                      "Want a simple 5 to 7 page site that looks clean and professional",
                      "Do not want to learn a website platform or deal with a big agency",
                      "Have a real business, practice, or project you are ready to share",
                      "Are fine with straightforward, non fancy design that is clear and easy to read"
                    ].map((item, i) => (
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
                    {[
                      "Need ecommerce, online courses, or complex booking systems",
                      "Need a large custom web app or portal",
                      "Want endless rounds of design changes",
                      "Expect a full marketing agency, SEO campaign, or ad management"
                    ].map((item, i) => (
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

        {/* Pricing */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-4">
              Simple, flat project pricing
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              No contracts, no subscriptions. Just one clear price for the kind of site you need.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: $500 */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Single-page starter</h3>
                  <div>
                    <div className="text-4xl font-semibold text-primary">$500</div>
                    <p className="text-sm text-muted-foreground">one-time</p>
                  </div>
                  <p className="text-base leading-relaxed">
                    For when you just need something simple on the web that explains who you are and how to reach you.
                  </p>
                  <ul className="space-y-2 pt-2">
                    {[
                      "One clean, scrolling page",
                      "You provide the words and images, I tidy and place them",
                      "1 round of revisions",
                      "Usually ready within a few days"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Card 2: $1,000 */}
              <Card className="border-primary">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Small website</h3>
                  <div>
                    <div className="text-4xl font-semibold text-primary">$1,000</div>
                    <p className="text-sm text-muted-foreground">one-time</p>
                  </div>
                  <p className="text-base leading-relaxed">
                    For a small but complete website that feels put together without getting complicated.
                  </p>
                  <ul className="space-y-2 pt-2">
                    {[
                      "Up to 4 pages (for example: Home, About, Services or Work, Contact)",
                      "I help organize and lightly edit your content",
                      "2 rounds of revisions",
                      "Usually ready within a week"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Card 3: $1,500 */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Full simple site</h3>
                  <div>
                    <div className="text-4xl font-semibold text-primary">$1,500</div>
                    <p className="text-sm text-muted-foreground">one-time</p>
                  </div>
                  <p className="text-base leading-relaxed">
                    For when you want me more in your corner shaping what the site says as well as how it looks.
                  </p>
                  <ul className="space-y-2 pt-2">
                    {[
                      "Up to 6–7 pages",
                      "Help shaping structure and wording (light copy support)",
                      "3 rounds of revisions",
                      "Usually ready within a week"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
              Hosting and your domain are paid directly to your provider (usually around $100–$200 per year). If you want ongoing help after launch, we can keep things simple and talk about a small, separate maintenance arrangement.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">Common questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">How long does it take?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  Most sites take about 2 to 4 weeks once I have your content and we have done a kickoff call. I will give you a realistic timeline before we start and keep you updated as I go.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What if I don't have all my content ready?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  That is common. We can start with what you have. I will give you a simple checklist for the rest and we will fill it in together. The clearer your answers are, the better the site will feel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">Can I update the site myself after it's done?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  If you want to, yes. I will show you the basics and give you a short written guide for simple text or image updates. If you would rather not touch it, I can handle changes for you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What platform do you use?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  I use Lovable, a modern builder that lets me move fast without code. You don't have to log in or learn anything. You own the final site, and we can export or move it later if you ever want to.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">Do you do ecommerce or real estate sites?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  No. I focus on simple service, portfolio, nonprofit, and project sites. If you need full ecommerce or complex real estate listings, I am not the right fit and I can point you toward better options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-2 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg leading-relaxed font-medium">What if I need changes after the site launches?</span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  Small changes are easy to handle. We can either set up a simple monthly arrangement for ongoing edits, or I can price changes as one off updates. You will always know the cost before I do the work.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t-2 border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Simple websites for real work. Built with care.
          {" • "}
          <a href="/portal" className="hover:text-foreground transition-colors">
            Client portal
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
