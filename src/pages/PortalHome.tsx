import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  plan_type: string;
  monthly_fee_cents: number;
  setup_fee_cents: number;
  monthly_included_minutes: number;
  active: boolean;
}

interface UpdateRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
  size_tier: string;
  quoted_price_cents: number | null;
}

interface RequestLimits {
  included_requests: number;
  used_requests: number;
}

const PortalHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [limits, setLimits] = useState<RequestLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/portal');
      return;
    }

    setUser(session.user);
    await loadClientData(session.user.email!);
  };

  const loadClientData = async (email: string) => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (clientError || !clientData) {
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data: requestsData } = await supabase
      .from('update_requests')
      .select('id, title, status, created_at, size_tier, quoted_price_cents')
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setRequests(requestsData || []);

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data: limitsData } = await supabase
      .from('request_limits')
      .select('included_requests, used_requests')
      .eq('client_id', clientData.id)
      .eq('month', monthStart.toISOString().split('T')[0])
      .maybeSingle();

    setLimits(limitsData || { included_requests: 2, used_requests: 0 });
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "default", label: "New" },
      in_progress: { variant: "secondary", label: "In progress" },
      waiting_on_client: { variant: "outline", label: "Waiting on you" },
      done: { variant: "secondary", label: "Done" }
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatQuotedPrice = (sizeTier: string, quotedPriceCents: number | null) => {
    if (sizeTier === 'tiny') return 'Free';
    if (sizeTier === 'large' || quotedPriceCents === null) return 'Quote pending';
    return formatCurrency(quotedPriceCents);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/portal');
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
              You are logged in, but I do not see a client record for this email yet. If this seems wrong, send me a note.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Hi, {client.name}.</h1>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your website details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.website_url && (
              <div>
                <Button variant="outline" asChild>
                  <a href={client.website_url} target="_blank" rel="noopener noreferrer">
                    Open my site <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Plan</p>
              {client.plan_type === 'build_only' ? (
                <p>
                  Build Only. You paid {formatCurrency(client.setup_fee_cents)} for your website build.
                </p>
              ) : (
                <div>
                  <p>
                    Care Plan. Monthly fee: {formatCurrency(client.monthly_fee_cents)}.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Included requests each month: {limits?.included_requests || 2}
                  </p>
                  {limits && (
                    <p className="text-sm text-muted-foreground">
                      Used this month: {limits.used_requests} of {limits.included_requests}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What your request status means</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">New</span> – I've received your request but haven't started yet
              </div>
              <div>
                <span className="font-semibold">In progress</span> – I'm working on it
              </div>
              <div>
                <span className="font-semibold">Waiting on you</span> – I need something from you (I'll note what)
              </div>
              <div>
                <span className="font-semibold">Done</span> – The update is finished
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your recent requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {client.plan_type === 'build_only' ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                You're on a build-only plan. Small fixes are free. Larger updates will show a quote before you approve anything.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your monthly included edits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Included minutes:</span>
                <span className="font-semibold">{client.monthly_included_minutes} minutes</span>
              </div>
              {limits && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Requests used this month:</span>
                    <span className="font-semibold">{limits.used_requests} of {limits.included_requests}</span>
                  </div>
                  <Progress 
                    value={(limits.used_requests / limits.included_requests) * 100} 
                    className="h-2"
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What small fixes are always free</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Fixing typos</li>
              <li>Swapping one image</li>
              <li>Changing a sentence</li>
              <li>Adjusting spacing</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Anything larger gets an instant quote before I start.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={() => navigate('/portal/request')} size="lg" className="w-full">
            Use the request form
          </Button>
          <Button onClick={() => navigate('/portal/chat')} size="lg" variant="outline" className="w-full">
            Chat with AI about updates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortalHome;
