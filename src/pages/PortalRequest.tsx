import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { PortalNav } from "@/components/PortalNav";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
}

interface AIClassification {
  type: "free" | "paid";
  confidence: "high" | "medium" | "low";
  explanation: string;
  recommended_price: number;
}

const PortalRequest = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiClassification, setAiClassification] = useState<AIClassification | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [priceApproved, setPriceApproved] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    size_tier: "small"
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Debounced AI classification
  useEffect(() => {
    if (form.description.length < 20) {
      setAiClassification(null);
      return;
    }

    const timer = setTimeout(() => {
      classifyRequest(form.description);
    }, 600);

    return () => clearTimeout(timer);
  }, [form.description]);

  const classifyRequest = async (description: string) => {
    setAiLoading(true);
    setPriceApproved(false);

    try {
      const { data, error } = await supabase.functions.invoke('classify-edit-request', {
        body: { description }
      });

      if (error) {
        console.error('Classification error:', error);
        setAiClassification(null);
        return;
      }

      setAiClassification(data);
    } catch (err) {
      console.error('Classification exception:', err);
      setAiClassification(null);
    } finally {
      setAiLoading(false);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user.email) {
      toast.error("Please log in to access this page.");
      navigate('/portal');
      return;
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, business_name')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!clientData) {
      setLoading(false);
      return;
    }

    setClient(clientData);
    setLoading(false);
  };

  const calculateQuotedPrice = (sizeTier: string): number | null => {
    switch (sizeTier) {
      case 'tiny': return 0;
      case 'small': return 5000;
      case 'medium': return 10000;
      case 'large': return null;
      default: return 5000;
    }
  };

  const getQuoteDisplay = (sizeTier: string) => {
    switch (sizeTier) {
      case 'tiny':
        return {
          price: "$0",
          message: "If this really is a tiny fix, I will just take care of it for you as part of working together."
        };
      case 'small':
        return {
          price: "$50",
          message: "If this looks right, send the request and I will take care of it."
        };
      case 'medium':
        return {
          price: "$100",
          message: "If this looks right, send the request and I will take care of it."
        };
      case 'large':
        return {
          price: "Quote needed",
          message: "I will review this and email you a clear quote before doing anything."
        };
      default:
        return { price: "$50", message: "" };
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        continue;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not an allowed file type. Allowed: images, PDF, Word documents, text files.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) return;

    setUploading(true);

    // Upload files to storage
    const attachmentUrls: string[] = [];
    const uploadedFilePaths: string[] = [];

    try {
      for (const file of uploadedFiles) {
        const filePath = `${client.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('request-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          // Clean up previously uploaded files
          for (const path of uploadedFilePaths) {
            await supabase.storage.from('request-attachments').remove([path]);
          }
          setUploading(false);
          return;
        }

        uploadedFilePaths.push(filePath);

        const { data: { publicUrl } } = supabase.storage
          .from('request-attachments')
          .getPublicUrl(filePath);

        attachmentUrls.push(publicUrl);
      }

      const { error: requestError } = await supabase
        .from('update_requests')
        .insert({
          client_id: client.id,
          title: form.title,
          description: form.description,
          priority: form.priority,
          size_tier: form.size_tier,
          quoted_price_cents: calculateQuotedPrice(form.size_tier),
          status: 'new',
          attachments: attachmentUrls.map((url, index) => ({
            url,
            name: uploadedFiles[index].name,
            size: uploadedFiles[index].size
          })),
          ai_type: aiClassification?.type || null,
          ai_price_cents: aiClassification ? aiClassification.recommended_price * 100 : null,
          ai_explanation: aiClassification?.explanation || null,
          ai_confidence: aiClassification?.confidence || null
        });

      if (requestError) {
        console.error('Database error:', requestError);
        toast.error("Could not send request");
        // Clean up uploaded files
        for (const path of uploadedFilePaths) {
          await supabase.storage.from('request-attachments').remove([path]);
        }
        setUploading(false);
        return;
      }

      toast.success("Got it. I will review this and get back to you.");
      setUploading(false);
      navigate('/portal');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
      // Clean up any uploaded files
      for (const path of uploadedFilePaths) {
        await supabase.storage.from('request-attachments').remove([path]);
      }
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No client record found</CardTitle>
            <CardDescription>
              You need to be a registered client to submit requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/portal')} variant="outline" className="w-full">
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalNav currentPage="request" client={client} />
      <div className="max-w-2xl mx-auto py-8 px-4">

        <Card>
          <CardHeader>
            <CardTitle>Request a website change</CardTitle>
            <CardDescription>
              Tell me what you want changed on your site. I will review this and get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Short summary *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Update homepage hero"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">What do you want changed? *</Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  placeholder="Be as specific as you can."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                
                {/* AI Classification UI */}
                {aiLoading && (
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="pt-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing your request...</span>
                    </CardContent>
                  </Card>
                )}

                {!aiLoading && aiClassification && aiClassification.type === "free" && (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            This looks like a free edit.
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {aiClassification.explanation}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                            No charge for this kind of change.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!aiLoading && aiClassification && aiClassification.type === "paid" && aiClassification.confidence !== "low" && (
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                            Estimated cost: ${aiClassification.recommended_price}
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                            {aiClassification.explanation}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                            This is only charged if you choose to submit this request.
                          </p>
                        </div>
                        <div className="flex items-start space-x-2 pt-2 border-t border-blue-500/20">
                          <Checkbox 
                            id="price-approval" 
                            checked={priceApproved}
                            onCheckedChange={(checked) => setPriceApproved(checked as boolean)}
                          />
                          <Label htmlFor="price-approval" className="cursor-pointer text-sm leading-tight">
                            I approve this estimated cost
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!aiLoading && aiClassification && aiClassification.confidence === "low" && (
                  <Card className="bg-orange-500/10 border-orange-500/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-orange-900 dark:text-orange-100">
                            Can you describe this a bit more so I can give you an accurate quote?
                          </p>
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            {aiClassification.explanation}
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                            Please add more details above.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Upload files (optional)</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Multiple files supported
                  </p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
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
              </div>

              <div className="space-y-3">
                <Label>How big is this change?</Label>
                <RadioGroup 
                  value={form.size_tier} 
                  onValueChange={(value) => setForm({ ...form, size_tier: value })}
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="tiny" id="tiny" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="tiny" className="font-semibold cursor-pointer">
                          Tiny change (free)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          One typo, one sentence, or one image swap.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="small" id="small" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="small" className="font-semibold cursor-pointer">
                          Small change ($50)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          One section or block needs updating.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="medium" id="medium" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="medium" className="font-semibold cursor-pointer">
                          Medium change ($100)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          A whole page or a new section needs work.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="large" id="large" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="large" className="font-semibold cursor-pointer">
                          Not sure / probably bigger
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          This might be a bigger update or you are not sure.
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-2xl font-semibold text-primary">
                      Estimated cost: {getQuoteDisplay(form.size_tier).price}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getQuoteDisplay(form.size_tier).message}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Label>Priority</Label>
                <RadioGroup value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="font-normal cursor-pointer">Not urgent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="font-normal cursor-pointer">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="font-normal cursor-pointer">This is urgent</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  uploading || 
                  (aiClassification?.type === "paid" && !priceApproved) ||
                  (aiClassification?.confidence === "low")
                }
              >
                {uploading ? "Uploading files..." : "Send this request"}
              </Button>
              
              {aiClassification?.type === "paid" && !priceApproved && (
                <p className="text-sm text-center text-muted-foreground">
                  Please approve the estimated cost above to continue
                </p>
              )}
              
              {aiClassification?.confidence === "low" && (
                <p className="text-sm text-center text-muted-foreground">
                  Please add more details to your request to continue
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalRequest;
