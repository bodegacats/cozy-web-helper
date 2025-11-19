import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

const Index = () => {
  const [checklistAnswers, setChecklistAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const checklistQuestions = [
    { id: 1, text: "Do you have a clear idea of what pages your site needs?" },
    { id: 2, text: "Do you have most of your text content ready or can you write it?" },
    { id: 3, text: "Do you have photos or graphics, or know where to get them?" },
    { id: 4, text: "Are you okay with a simple, clean design rather than highly custom graphics?" },
    { id: 5, text: "Is your project a service, portfolio, informational site, or creative project?" },
    { id: 6, text: "Do you NOT need ecommerce or real estate listings?" },
    { id: 7, text: "Are you ready to launch within a few weeks?" },
  ];

  const handleChecklistSubmit = () => {
    setShowResult(true);
    const resultElement = document.getElementById('checklist-result');
    resultElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const yesCount = Object.values(checklistAnswers).filter(a => a === "yes").length;
  const noCount = Object.values(checklistAnswers).filter(a => a === "no").length;

  const getResultMessage = () => {
    if (yesCount >= 6) {
      return {
        title: "This service is probably a great fit.",
        message: "You're ready to go. Let's talk about your project.",
        cta: true
      };
    } else if (yesCount >= 4) {
      return {
        title: "This might work, but let's talk first.",
        message: "A few things to sort out, but we can probably make this happen.",
        cta: true
      };
    } else {
      return {
        title: "This might not be the right fit yet.",
        message: "You might need more prep time, or a different kind of service. But feel free to reach out if you want to talk through it.",
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
      {/* Hero Section */}
      <section className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Simple websites for real work.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            I build 5-7 page sites for small businesses, solo professionals, artists, nonprofits, and creative projects. Clean, functional, and done in a few weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={scrollToChecklist} className="shadow-base">
              Take the 7-question checklist
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToContact} className="border-2">
              Talk to me about my site
            </Button>
          </div>
        </div>
      </section>

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
                  I design and build your site, check in with you as I go, and make revisions based on your feedback.
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
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">Simple Website Sanity Checklist</h2>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              Answer these 7 questions to see if this service is right for your project.
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
                    "5-7 pages (Home, About, Services/Work, Contact, etc.)",
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
                <h3 className="text-xl font-semibold">Simple sites this works for</h3>
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

      {/* Pricing */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">Pricing</h2>
          <Card className="shadow-lg border-2">
            <CardContent className="p-8 text-center space-y-6">
              <div>
                <div className="text-5xl font-semibold text-primary mb-2">$1,500</div>
                <p className="text-lg leading-relaxed text-muted-foreground">One-time project fee</p>
              </div>
              <div className="border-t-2 border-border pt-6 space-y-4 text-left">
                <p className="text-base leading-relaxed">
                  This covers design, development, revisions, and launch. You own the site completely.
                </p>
                <p className="text-base leading-relaxed">
                  Hosting and domain registration are separate (usually $100-200/year through your own provider).
                </p>
                <p className="text-base leading-relaxed">
                  If you need ongoing updates or maintenance, we can discuss a simple retainer or per-update pricing.
                </p>
              </div>
              <Button size="lg" onClick={scrollToContact} className="mt-4">
                Start a conversation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-center mb-12">Common questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">How long does it take?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                Most sites are done in 2-4 weeks, depending on how quickly you can provide content and feedback.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">What if I don't have all my content ready?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                That's fine. I can help you figure out what you need, or we can work in phases. But the more ready you are, the faster we can move.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">Can I update the site myself after it's done?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                Yes. I'll set it up so you can edit text, add images, and make simple changes. I'll show you how everything works.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">What platform do you use?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                I typically use WordPress or static site generators, depending on what makes sense for your project and technical comfort level.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">Do you do ecommerce or real estate sites?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                No. Those require different tools and ongoing management that's outside the scope of this service.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-2 rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="body-lg font-medium">What if I need changes after the site launches?</span>
              </AccordionTrigger>
              <AccordionContent className="body-base text-foreground-muted">
                Small tweaks right after launch are included. For bigger updates down the road, we can work out a simple hourly rate or retainer.
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

      {/* Footer */}
      <footer className="py-8 text-center border-t-2 border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Simple websites for real work. Built with care.
        </p>
      </footer>
    </div>
  );
};

export default Index;
