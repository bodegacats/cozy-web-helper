import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getCurrentMonthStart } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
}

const PortalRequest = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false);
  const [openRequestsCount, setOpenRequestsCount] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    size_tier: "small"
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/portal');
      return;
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name')
      .eq('email', session.user.email!)
      .maybeSingle();

    if (!clientData) {
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data: requestsData, count } = await supabase
      .from('update_requests')
      .select('id', { count: 'exact' })
      .eq('client_id', clientData.id)
      .neq('status', 'done');

    const openCount = count || 0;
    setOpenRequestsCount(openCount);
    setCanSubmit(openCount < 2);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) return;

    if (!canSubmit) {
      toast.error("You already have two active requests");
      return;
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
        status: 'new'
      });

    if (requestError) {
      toast.error("Could not send request");
      return;
    }

    const monthStart = getCurrentMonthStart();
    const monthKey = monthStart.toISOString().split('T')[0];

    const { data: existingLimit } = await supabase
      .from('request_limits')
      .select('*')
      .eq('client_id', client.id)
      .eq('month', monthKey)
      .maybeSingle();

    if (existingLimit) {
      await supabase
        .from('request_limits')
        .update({ used_requests: existingLimit.used_requests + 1 })
        .eq('id', existingLimit.id);
    } else {
      await supabase
        .from('request_limits')
        .insert({
          client_id: client.id,
          month: monthKey,
          included_requests: 2,
          used_requests: 1
        });
    }

    toast.success("Got it. I will review this and get back to you.");
    navigate('/portal/home');
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
            <Button onClick={() => navigate('/portal/home')} variant="outline" className="w-full">
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Request limit reached</CardTitle>
            <CardDescription>
              You already have two active requests. Once one is marked done, you can send another.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/portal/home')} className="w-full">
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/portal/home')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>

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

              <Button type="submit" className="w-full">
                Send this request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalRequest;
