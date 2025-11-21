import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIIntake = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help you figure out if a simple website project is right for your needs. I'll ask you some questions about what you're looking for, and at the end we'll see if we're a good match. Sound good?",
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

  const parseIntakeJSON = (content: string) => {
    // Try to find JSON in the message
    const jsonMatch = content.match(/\{[\s\S]*"name"[\s\S]*"email"[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map fields from AI's JSON schema to our database schema
      return {
        name: parsed.name || "",
        email: parsed.email || "",
        business_name: parsed.business_name || null,
        website_url: parsed.website_url || null,
        project_description: parsed.project_description || "",
        goals: parsed.goal || "",
        pages_estimate: parsed.pages ? parseInt(parsed.pages) : null,
        content_readiness: parsed.content_ready || "",
        timeline: parsed.timeline || "",
        budget_range: parsed.budget || "",
        design_examples: parsed.design_examples || "",
        special_needs: parsed.advanced_features || "",
        tech_comfort: parsed.update_preference || "",
        fit_status: parsed.fit === "good" ? "good" : parsed.fit === "maybe" ? "borderline" : "not_fit",
        suggested_tier: parsed.budget?.includes("1500") || parsed.budget?.includes("$1,500") ? "1500" 
                      : parsed.budget?.includes("500") || parsed.budget?.includes("$500") ? "500"
                      : "1000",
        raw_summary: parsed.intake_summary || "",
        raw_conversation: parsed.raw_chat || messages,
      };
    } catch (e) {
      console.error("Failed to parse intake JSON:", e);
      return null;
    }
  };

  const createIntake = async (intakeData: any) => {
    try {
      const { error } = await supabase.functions.invoke("ai-intake", {
        body: {
          action: "create_intake",
          intakeData,
        },
      });

      if (error) throw error;

      setIsComplete(true);
      toast.success("Intake submitted! I'll review and follow up by email soon.");
    } catch (error) {
      console.error("Error creating intake:", error);
      toast.error("Failed to save your intake. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-intake", {
        body: {
          messages: [...messages, { role: "user", content: userMessage }],
        },
      });

      if (error) throw error;

      if (data.message) {
        const assistantMessage = { role: "assistant" as const, content: data.message };
        setMessages((prev) => [...prev, assistantMessage]);

        // Check if the message contains the final JSON output
        const intakeData = parseIntakeJSON(data.message);
        if (intakeData && intakeData.email && intakeData.name) {
          // Automatically create the intake
          await createIntake(intakeData);
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-strong:font-semibold">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
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
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20 text-center">
                <p className="text-base font-medium mb-2">All set!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  I'll review your answers and email you within a day or two. If I'm not the right fit, I'll say so directly.
                </p>
                <Button onClick={() => navigate("/")}>Back to Home</Button>
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
