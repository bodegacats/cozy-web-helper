import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft } from "lucide-react";

const Estimate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "submitted">("form");

  // Form state
  const [siteType, setSiteType] = useState("personal");
  const [contentHelp, setContentHelp] = useState("none");
  const [pageCount, setPageCount] = useState([3]);
  const [addOns, setAddOns] = useState({
    portfolio: false,
    blog: false,
    scheduling: false,
    newsletter: false,
  });
  const [timeline, setTimeline] = useState("normal");

  // Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate price
  const calculatePrice = () => {
    let total = 50000; // Base $500 in cents

    // Content help
    const contentCosts: Record<string, number> = {
      none: 0,
      light: 15000,
      moderate: 30000,
      full: 60000,
    };
    total += contentCosts[contentHelp];

    // Extra pages (first page included)
    total += (pageCount[0] - 1) * 20000;

    // Add-ons
    if (addOns.portfolio) total += 30000;
    if (addOns.blog) total += 30000;
    if (addOns.scheduling) total += 15000;
    if (addOns.newsletter) total += 20000;

    // Timeline
    if (timeline === "rush") total += 15000;

    const estimateLow = Math.round(total * 0.9);
    const estimateHigh = Math.round(total * 1.1);

    return { estimateLow, estimateHigh, total };
  };

  const { estimateLow, estimateHigh } = calculatePrice();

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    const selectedOptions = {
      siteType,
      contentHelp,
      pageCount: pageCount[0],
      addOns,
      timeline,
    };

    // Generate a summary for project_description
    const siteTypeLabels: Record<string, string> = {
      personal: "Personal or solo-professional site",
      business: "Small business or organization site",
      creative: "Creative project site",
    };

    const contentLabels: Record<string, string> = {
      none: "Client will write all content",
      light: "Light editing needed",
      moderate: "Help shaping the wording",
      full: "Full content rewrite",
    };

    const addOnsList = [];
    if (addOns.portfolio) addOnsList.push("Portfolio/gallery page");
    if (addOns.blog) addOnsList.push("Blog page");
    if (addOns.scheduling) addOnsList.push("Scheduling integration");
    if (addOns.newsletter) addOnsList.push("Newsletter integration");

    const projectDescription = `
Estimate Request:
- Site type: ${siteTypeLabels[siteType]}
- Pages: ${pageCount[0]}
- Content help: ${contentLabels[contentHelp]}
- Add-ons: ${addOnsList.length > 0 ? addOnsList.join(", ") : "None"}
- Timeline: ${timeline === "rush" ? "Rush (48-72 hours)" : "Normal"}
- Estimated price range: ${formatPrice(estimateLow)} - ${formatPrice(estimateHigh)}
    `.trim();

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name,
        email,
        project_description: projectDescription,
        wish: "Estimate request",
        selected_options: selectedOptions,
        estimate_low: estimateLow,
        estimate_high: estimateHigh,
        notes: notes || null,
        status: "new",
      });

      if (error) throw error;

      setStep("submitted");
      toast({
        title: "Estimate sent!",
        description: "I'll review your estimate and get back to you within 24 hours.",
      });
    } catch (error) {
      console.error("Error submitting estimate:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact me directly.",
        variant: "destructive",
      });
    }
  };

  if (step === "submitted") {
    return (
      <div className="min-h-screen bg-background py-20">
        <Helmet>
          <title>Thank You | Build Me a Simple Site</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Thank you!</CardTitle>
              <CardDescription className="text-lg mt-2">
                I've received your estimate request and will review it carefully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                You should hear back from me within 24 hours with a personalized quote and next
                steps.
              </p>
              <Button asChild variant="outline">
                <a href="/">Back to homepage</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <Helmet>
        <title>Website Pricing Estimator | Build Me a Simple Site</title>
        <meta
          name="description"
          content="Get an instant price estimate for your website project. Answer a few questions to see your personalized price range."
        />
        <link rel="canonical" href="https://buildmeasimplesite.com/estimate" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Website Pricing Estimator | Build Me a Simple Site" />
        <meta
          property="og:description"
          content="Get an instant price estimate for your website project. Answer a few questions to see your personalized price range."
        />
        <meta property="og:url" content="https://buildmeasimplesite.com/estimate" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Build Me a Simple Site" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          aria-label="Return to homepage"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing Estimator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions to get an instant price estimate for your website project.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Questions Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Question 1: Site Type */}
            <Card>
              <CardHeader>
                <CardTitle>What kind of site are you building?</CardTitle>
                <CardDescription>This helps me understand your project context.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={siteType} onValueChange={setSiteType}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="font-normal cursor-pointer">
                      Personal or solo-professional
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="font-normal cursor-pointer">
                      Small business or organization
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative" id="creative" />
                    <Label htmlFor="creative" className="font-normal cursor-pointer">
                      Creative project (book, film, event)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 2: Content Help */}
            <Card>
              <CardHeader>
                <CardTitle>How much help do you want with wording?</CardTitle>
                <CardDescription>Content editing and writing services.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={contentHelp} onValueChange={setContentHelp}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="font-normal cursor-pointer">
                      I'll write everything <span className="text-muted-foreground">(free)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal cursor-pointer">
                      Light editing <span className="text-muted-foreground">(+$150)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="font-normal cursor-pointer">
                      Help shaping the wording <span className="text-muted-foreground">(+$300)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="font-normal cursor-pointer">
                      Full rewrite <span className="text-muted-foreground">(+$600)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 3: Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle>Do you need any of these?</CardTitle>
                <CardDescription>Select all that apply.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="portfolio"
                    checked={addOns.portfolio}
                    onCheckedChange={(checked) =>
                      setAddOns({ ...addOns, portfolio: checked as boolean })
                    }
                  />
                  <Label htmlFor="portfolio" className="font-normal cursor-pointer">
                    Portfolio/gallery page <span className="text-muted-foreground">(+$300)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blog"
                    checked={addOns.blog}
                    onCheckedChange={(checked) => setAddOns({ ...addOns, blog: checked as boolean })}
                  />
                  <Label htmlFor="blog" className="font-normal cursor-pointer">
                    Blog page <span className="text-muted-foreground">(+$300)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scheduling"
                    checked={addOns.scheduling}
                    onCheckedChange={(checked) =>
                      setAddOns({ ...addOns, scheduling: checked as boolean })
                    }
                  />
                  <Label htmlFor="scheduling" className="font-normal cursor-pointer">
                    Scheduling/booking integration{" "}
                    <span className="text-muted-foreground">(+$150)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={addOns.newsletter}
                    onCheckedChange={(checked) =>
                      setAddOns({ ...addOns, newsletter: checked as boolean })
                    }
                  />
                  <Label htmlFor="newsletter" className="font-normal cursor-pointer">
                    Newsletter signup integration{" "}
                    <span className="text-muted-foreground">(+$200)</span>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Question 4: Page Count */}
            <Card>
              <CardHeader>
                <CardTitle>How many pages?</CardTitle>
                <CardDescription>
                  The first page is included. Each additional page is +$200.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">{pageCount[0]} pages</Label>
                    <span className="text-sm text-muted-foreground">
                      {pageCount[0] === 1
                        ? "Included"
                        : `+$${((pageCount[0] - 1) * 200).toFixed(0)}`}
                    </span>
                  </div>
                  <Slider
                    value={pageCount}
                    onValueChange={setPageCount}
                    min={1}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 page</span>
                    <span>8 pages</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question 5: Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>When do you need your site completed?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={timeline} onValueChange={setTimeline}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="font-normal cursor-pointer">
                      Normal timeline <span className="text-muted-foreground">(included)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rush" id="rush" />
                    <Label htmlFor="rush" className="font-normal cursor-pointer">
                      Rush 48-72 hours <span className="text-muted-foreground">(+$150)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary Column */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Your Estimate</CardTitle>
                <CardDescription>Based on your selections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="text-center py-6 bg-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Estimated range</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(estimateLow)} - {formatPrice(estimateHigh)}
                  </div>
                </div>

                {/* Selected Options Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base price</span>
                    <span>$500</span>
                  </div>
                  {pageCount[0] > 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {pageCount[0] - 1} extra page{pageCount[0] > 2 ? "s" : ""}
                      </span>
                      <span>+${((pageCount[0] - 1) * 200).toFixed(0)}</span>
                    </div>
                  )}
                  {contentHelp !== "none" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content help</span>
                      <span>
                        +$
                        {{
                          light: "150",
                          moderate: "300",
                          full: "600",
                        }[contentHelp] || "0"}
                      </span>
                    </div>
                  )}
                  {addOns.portfolio && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Portfolio</span>
                      <span>+$300</span>
                    </div>
                  )}
                  {addOns.blog && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blog</span>
                      <span>+$300</span>
                    </div>
                  )}
                  {addOns.scheduling && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduling</span>
                      <span>+$150</span>
                    </div>
                  )}
                  {addOns.newsletter && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Newsletter</span>
                      <span>+$200</span>
                    </div>
                  )}
                  {timeline === "rush" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rush delivery</span>
                      <span>+$150</span>
                    </div>
                  )}
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific requirements or questions?"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send me my estimate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimate;
