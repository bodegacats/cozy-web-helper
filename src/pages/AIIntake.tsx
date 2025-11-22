import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { marked } from 'marked';
import { Helmet } from "react-helmet";
import { submitLead } from "@/lib/lead-submission";

// Configure marked for good defaults
marked.setOptions({
  breaks: true,
  gfm: true
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Calculate price helper (matching pricing engine)
const calculatePrice = (pages: number, contentReadiness: string, rush: boolean): number => {
  let price = 500; // Base price includes 1 page
  if (pages > 1) {
    price += (pages - 1) * 150; // Each additional page
  }
  if (contentReadiness === "heavy") {
    price += 300; // Content shaping
  }
  if (rush) {
    price += 200;
  }
  return price * 100; // Return in cents
};

const parseIntakeJSON = (content: string): any | null => {
  try {
    console.log("=== PARSING AI INTAKE JSON ===");
    console.log("Raw content:", content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in content");
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log("Parsed JSON:", parsed);
    
    const result = {
      name: String(parsed.name || ""),
      email: String(parsed.email || ""),
      business_name: String(parsed.business_name || ""),
      website_url: String(parsed.website_url || ""),
      project_description: String(parsed.project_description || ""),
      goals: String(parsed.goals || ""), // Fixed: was "goal"
      pages_estimate: Number(parsed.pages || 0),
      content_readiness: String(parsed.content_readiness || ""), // Fixed: was "content_ready"
      timeline: String(parsed.timeline || ""),
      budget_range: String(parsed.budget_range || ""), // Fixed: was "budget"
      vibe: String(parsed.vibe || ""),
      lovable_build_prompt: String(parsed.lovable_build_prompt || ""),
      raw_summary: String(parsed.intake_summary || ""),
      raw_conversation: parsed.raw_chat || [],
      suggested_tier: null,
      discount_offered: Boolean(parsed.discount_offered),
      discount_amount: Number(parsed.discount_amount || 0),
      special_needs: String(parsed.advanced_features || ""),
      tech_comfort: String(parsed.update_preference || ""),
      fit_status: String(parsed.fit || "good"),
      inspiration_sites: String(parsed.inspiration_sites || ""), // Fixed: was "design_examples"
      color_preferences: String(parsed.color_preferences || ""), // Fixed: was "color_style_preferences"
    };
    
    console.log("Mapped result:", result);
    return result;
  } catch (error) {
    console.error("Failed to parse AI intake JSON:", error);
    return null;
  }
};

const AIIntake = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help you figure out if a simple website project is right for your needs. I'll ask you some questions about what you're looking for, and at the end we'll see if we're a good match. Most simple sites use Home, About, Services, and Contact—want to add anything like a gallery or FAQ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createIntake = async (intakeData: any) => {
    try {
      console.log("=== CREATING INTAKE ===");
      console.log("Intake data:", intakeData);
      
      await submitLead({
        type: "ai_intake",
        payload: intakeData,
        successMessage: "Intake submitted! I'll review and follow up by email soon.",
      });
      
      console.log("Intake created successfully");
      setIsComplete(true);
    } catch (error) {
      console.error("Error creating intake:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log("=== AI INTAKE SEND ===");
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Messages being sent:", [...messages, userMessage]);
      
      const { data, error } = await supabase.functions.invoke("ai-intake", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      console.log("AI response received:", data);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if the response contains the final JSON
      const intakeData = parseIntakeJSON(data.message);
      if (intakeData) {
        console.log("Final intake data detected, creating intake...");
        await createIntake(intakeData);
      }
    } catch (error: any) {
      console.error("Error in AI intake:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Website Intake Assistant | Build Me a Simple Site</title>
        <meta name="title" content="Website Intake Assistant | Build Me a Simple Site" />
        <meta name="description" content="Use our AI intake assistant to quickly determine if a simple website project is right for your needs. Answer a few questions to get started." />
        <meta name="keywords" content="website intake, AI assistant, website consultation, website estimate, web project questionnaire" />
        <link rel="canonical" href="https://buildmeasimplesite.com/start" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buildmeasimplesite.com/start" />
        <meta property="og:site_name" content="Build Me a Simple Site" />
        <meta property="og:title" content="Website Intake Assistant | Build Me a Simple Site" />
        <meta property="og:description" content="Use our AI intake assistant to quickly determine if a simple website project is right for your needs. Answer a few questions to get started." />
        <meta property="og:image" content="https://buildmeasimplesite.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://buildmeasimplesite.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://buildmeasimplesite.com/start" />
        <meta name="twitter:title" content="Website Intake Assistant | Build Me a Simple Site" />
        <meta name="twitter:description" content="Use our AI intake assistant to quickly determine if a simple website project is right for your needs." />
        <meta name="twitter:image" content="https://buildmeasimplesite.com/og-image.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Website Intake Assistant",
            "description": "Use our AI intake assistant to quickly determine if a simple website project is right for your needs.",
            "url": "https://buildmeasimplesite.com/start",
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
                  "name": "Website Intake Assistant",
                  "item": "https://buildmeasimplesite.com/start"
                }
              ]
            }
          })}
        </script>
      </Helmet>
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Website Intake Assistant
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions here to see if we're a good fit. This gives you a structured scope and estimate. If you prefer a calculator, use the guided estimator instead.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-lg border-2 mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-muted mr-12"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div 
                        className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-strong:font-semibold"
                        dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-muted mr-12">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isComplete && (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {isComplete && (
              <div className="p-6 rounded-lg bg-primary/5 border-2 border-primary/20 text-center">
                <h2 className="text-2xl font-semibold mb-3">Thanks — your project details are submitted</h2>
                <p className="text-base text-muted-foreground mb-6">
                  Dan will follow up within one business day.
                </p>
                <Button onClick={() => navigate("/")} size="lg">Return to homepage</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground">
          When you're done, I'll review your answers and email you within a day or two.
        </p>
      </div>
    </div>
  );
};

export default AIIntake;
