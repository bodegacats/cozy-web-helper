import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

const Index = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Simple websites for real work and real projects
          </h1>
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
            I help people put their work on the web without headaches, big bills, or long contracts.
          </p>
          <p className="mb-12 text-base text-muted-foreground/80 md:text-lg">
            Good for small service businesses, solo professionals, artists, coaches, nonprofits, film projects, and other serious ideas that need a clean, honest site.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection("checklist")}
              className="w-full sm:w-auto"
            >
              Take the 7 question checklist
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto"
            >
              See how my website service works
            </Button>
          </div>
        </div>
      </section>

      {/* How This Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-foreground">How this works</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl font-bold text-primary">1</div>
                <CardTitle>Quick call</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  About 30 minutes so I can understand your work or project, what you offer, and what you want people to do on your site.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl font-bold text-primary">2</div>
                <CardTitle>First draft in about 5 days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You send me any logo, photos, and text you already have. I turn that into a simple, clean website draft.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl font-bold text-primary">3</div>
                <CardTitle>Tidy it up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You tell me what feels off. I fix the text, photos, and layout so it feels like you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl font-bold text-primary">4</div>
                <CardTitle>Launch and relax</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I connect your domain, launch the site, and keep it running. You do not have to log in to anything. When you need changes, you just ask.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Actually Get */}
      <section className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-foreground">What you actually get</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <span className="text-lg">A clean, simple website that makes your work, business, or project look real and trustworthy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <span className="text-lg">Works on phones and laptops</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <span className="text-lg">A clear next step for visitors, whether that is calling you, requesting info, applying, or reaching out about a project</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <span className="text-lg">One person who knows your work and handles your changes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <span className="text-lg">No dashboards to learn. No platform to manage.</span>
                </li>
              </ul>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                I do not sell platforms or solutions. Just a website that works, and a person you can reach.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-foreground">Pricing that will not surprise you</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Setup: $1,250 one time</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>5 to 7 page website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>First draft in about 5 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Launch in about 3 weeks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Monthly fee: $49</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Hosting and basic maintenance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Up to 3 small change requests each month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Month to month. No contract. Cancel any time.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bigger changes later</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>$150 per hour for new pages or bigger updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>I always quote before I start</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="mt-12 text-center text-lg text-muted-foreground">
            You will always know what you are paying and why.
          </p>
        </div>
      </section>

      {/* Who You Are Actually Working With */}
      <section className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-foreground">Who you are actually working with</h2>
          <div className="grid gap-12 md:grid-cols-[300px,1fr] md:items-center">
            <div className="mx-auto">
              <div className="h-64 w-64 overflow-hidden rounded-full bg-accent">
                <img
                  src="/placeholder.svg"
                  alt="Dan - your website person"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-foreground">
              <p>I am Dan. I have spent years talking with small business owners about websites. A lot of them told me the same thing:</p>
              <p className="italic text-muted-foreground">"I just want a simple site, a fair price, and one person to call."</p>
              <p>That is what this is.</p>
              <p>I build your site myself. I answer my own phone. If I am not the right fit, I will tell you and point you to something cheaper that might work better.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Sites I Have Worked On */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-foreground">Simple sites I have worked on</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg bg-accent">
                <img
                  src="/placeholder.svg"
                  alt="Service business website example"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Service business example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clean, straightforward design that builds trust and makes it easy to request a quote or book a call.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg bg-accent">
                <img
                  src="/placeholder.svg"
                  alt="Portfolio or artist website example"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Portfolio or artist example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple showcase that lets your work speak for itself with a clear way to get in touch or commission work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg bg-accent">
                <img
                  src="/placeholder.svg"
                  alt="Film or project website example"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Film or project example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Direct, honest layout for creative projects, investment opportunities, or campaigns that need credibility and a clear ask.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg bg-accent">
                <img
                  src="/placeholder.svg"
                  alt="Nonprofit or community website example"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Nonprofit or community example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Warm, accessible site that explains your mission and makes it easy for people to support, volunteer, or learn more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Website Sanity Checklist */}
      <section id="checklist" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-4xl font-bold text-foreground">Simple Website Sanity Checklist</h2>
          <p className="mb-12 text-center text-lg leading-relaxed text-foreground">
            If you already have a website but are not sure if it is helping or hurting, run it through this quick sanity check.
            <br />
            <br />
            No tools. No scores. Just 7 honest questions.
          </p>

          <Card className="mb-12">
            <CardContent className="pt-6">
              <ol className="space-y-4 text-lg">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>When someone lands on your homepage, is it clear what you do in 5 seconds or less?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Is it obvious how to contact you?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Does your site look decent on a phone?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Do you clearly say where you are based?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>Do you show at least one real review or testimonial?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">6.</span>
                  <span>Do you tell people what you want them to do next (call, book, request quote)?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">7.</span>
                  <span>Are you not embarrassed to send your site to someone right now?</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">If you answered 'yes' to 6 or 7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your site is probably fine. You might want a facelift, but you do not need to panic or spend a ton of money.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">If you answered 'yes' to 3 to 5</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your website is doing some things well but is leaving trust and money on the table. A simple rebuild or refresh could help.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">If you answered 'yes' fewer than 3 times</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your website is probably confusing people or making you look less serious than you are. It might be easier to start fresh.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="mb-6 text-lg leading-relaxed text-foreground">
              If your score feels low and you are tired of messing with this, send me a quick note.
              <br />
              <br />
              Tell me what you do and drop your site link. I will tell you honestly if you should fix it yourself, stay where you are, or have me rebuild it.
            </p>
            <Button size="lg" onClick={() => scrollToSection("contact")}>
              Talk to me about my site
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-foreground">Questions people usually ask</h2>
          <Accordion type="single" collapsible defaultValue="item-0">
            <AccordionItem value="item-0">
              <AccordionTrigger className="text-left text-lg">
                What kinds of websites do you build?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Simple 5 to 7 page sites for service businesses, solo professionals, artists, coaches, nonprofits, film and other creative projects, and similar work that needs a clear, honest web presence. I do not build online stores or real estate listing sites.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg">
                Do I have to sign a contract?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                No. It is month to month. You can cancel any time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg">
                What happens if I cancel?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Your site goes offline when the month you already paid for ends. I can give you a backup of the site files if you want to take it elsewhere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg">
                What counts as a 'small change'?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Things like swapping text, replacing photos, adding a testimonial, or fixing a typo. If it feels like about 15 minutes of work, it is a small change. Bigger changes get a quote first.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg">
                How long does this take?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Most sites go from 'let us start' to 'live' in about 3 weeks.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg">
                Do I have to learn any software?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                No. You do not log in to anything. Just send me an email or text when you need something changed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground">Ready to talk about your site?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Send me a note at{" "}
            <a href="mailto:hello@example.com" className="font-medium text-primary hover:underline">
              hello@example.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            I usually respond within a day. Sometimes faster if I am at my desk.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
