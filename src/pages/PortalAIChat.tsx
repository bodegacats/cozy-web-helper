import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { markdownToHtml } from "@/lib/markdown-utils";
import { PortalNav } from "@/components/PortalNav";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  business_name: string | null;
}

const PortalAIChat = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user.email) {
      toast.error("No valid session found");
      navigate('/portal');
      return;
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, email, business_name')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!clientData) {
      toast.error("No client record found");
      navigate('/portal');
      return;
    }

    setClient(clientData);
    setLoading(false);

    // Set initial greeting
    setMessages([
      {
        role: "assistant",
        content: `Hi ${clientData.name}! I'm here to help you with website updates. You can describe what you'd like changed, and I'll give you an instant quote. Want to discuss some updates?`,
      },
    ]);
  };

  const parseRequestJSON = (content: string) => {
    const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"description"[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || "",
        description: parsed.description || "",
        size_tier: parsed.size_tier || "small",
        priority: parsed.priority || "normal",
        quoted_price_cents: parsed.quoted_price_cents || 5000,
      };
    } catch (e) {
      console.error("Failed to parse request JSON:", e);
      return null;
    }
  };

  const createRequest = async (requestData: any) => {
    if (!client) return;

    try {
      // Upload files if any
      const attachmentUrls: string[] = [];
      
      for (const file of uploadedFiles) {
        const filePath = `${client.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('request-attachments')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('request-attachments')
          .getPublicUrl(filePath);

        attachmentUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('update_requests')
        .insert({
          client_id: client.id,
          title: requestData.title,
          description: requestData.description,
          size_tier: requestData.size_tier,
          priority: requestData.priority,
          quoted_price_cents: requestData.quoted_price_cents,
          status: 'new',
          attachments: attachmentUrls.map((url, index) => ({
            url,
            name: uploadedFiles[index].name,
            size: uploadedFiles[index].size
          }))
        });

      if (error) throw error;

      setIsComplete(true);
      toast.success("Request submitted! I'll review and follow up soon.");
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to save your request. Please try again.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !client) return;

    const userMessage = input.trim();
    let contextMessage = userMessage;
    
    // Add file context if files are attached
    if (uploadedFiles.length > 0) {
      contextMessage += `\n\n[User has attached ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(', ')}]`;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("portal-ai-chat", {
        body: {
          messages: [...messages, { role: "user", content: contextMessage }],
          clientName: client.name,
        },
      });

      if (error) throw error;

      if (data.message) {
        const assistantMessage = { role: "assistant" as const, content: data.message };
        setMessages((prev) => [...prev, assistantMessage]);

        const requestData = parseRequestJSON(data.message);
        if (requestData && requestData.title) {
          await createRequest(requestData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {client && <PortalNav currentPage="chat" client={client} />}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Chat about website updates
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell me what you want changed, and I'll give you an instant quote. 
            You can also just send the request through the form if you prefer.
          </p>
        </div>

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
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
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
              <>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">Attached files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
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
              </>
            )}

            {isComplete && (
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20 text-center">
                <p className="text-base font-medium mb-2">Request submitted!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  I'll review your request and get back to you soon.
                </p>
                <Button onClick={() => navigate("/portal")}>Back to Portal</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalAIChat;
