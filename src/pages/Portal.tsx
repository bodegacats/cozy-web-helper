import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ExternalLink, ArrowLeft, Trash2 } from "lucide-react";
import { CancelRequestDialog } from "@/components/CancelRequestDialog";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
}

interface UpdateRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const Portal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  const loadClientData = async () => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (clientError) {
      console.error('Error loading client:', clientError);
      return;
    }

    setClient(clientData);

    if (clientData) {
      const { data: requestsData } = await supabase
        .from('update_requests')
        .select('id, title, status, created_at')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRequests(requestsData || []);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! You can now log in.");
        setIsSignup(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
      }
    }
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    const { error } = await supabase
      .from('update_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestToCancel.id);

    if (error) {
      console.error('Cancel error:', error);
      toast.error(error.message || "Could not cancel request.");
      return;
    }

    toast.success("Request cancelled");
    setCancelDialogOpen(false);
    setRequestToCancel(null);
    loadClientData();
  };

  const openCancelDialog = (id: string, title: string) => {
    setRequestToCancel({ id, title });
    setCancelDialogOpen(true);
  };


  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'waiting_on_client': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In progress';
      case 'waiting_on_client': return 'Waiting on you';
      case 'done': return 'Done';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isSignup ? "Create account" : "Client portal"}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignup 
                ? "Set up your client account to access your project."
                : "If I have already built your site, you can log in here and send change requests."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isSignup ? "Create account" : "Log in"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup 
                  ? "Already have an account? Log in" 
                  : "Need an account? Sign up"
                }
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-lg text-center text-muted-foreground">
              You are logged in, but I do not see a client record for this email yet. If this seems wrong, send me a note.
            </p>
            <div className="mt-6 text-center">
              <Button onClick={() => supabase.auth.signOut()}>
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Hi, {client.name}.</CardTitle>
                {client.website_url && (
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <a href={client.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open my site
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Log out
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your recent requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-muted-foreground">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                      {request.status === 'new' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCancelDialog(request.id, request.title)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/portal/request")}
              className="flex-1"
            >
              Submit a new request
            </Button>
            <Button 
              onClick={() => navigate("/portal/chat")}
              variant="outline"
              className="flex-1"
            >
              Chat with AI
            </Button>
          </CardContent>
        </Card>
      </div>

      <CancelRequestDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelRequest}
        requestTitle={requestToCancel?.title || ""}
      />
    </div>
  );
};

export default Portal;
