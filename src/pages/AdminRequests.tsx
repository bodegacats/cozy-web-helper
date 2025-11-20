import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface UpdateRequest {
  id: string;
  client_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  internal_notes: string | null;
  size_tier: string;
  quoted_price_cents: number | null;
  attachments: Array<{ url: string; name: string; size: number }> | null;
  ai_type: string | null;
  ai_price_cents: number | null;
  ai_explanation: string | null;
  ai_confidence: string | null;
  clients: {
    name: string;
    email: string;
    business_name: string | null;
    website_url: string | null;
  };
}

const AdminRequests = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    internal_notes: ""
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadRequests();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, priorityFilter]);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('update_requests')
      .select(`
        *,
        clients (
          name,
          email,
          business_name,
          website_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
    } else {
      // Type the data properly
      const typedData = (data || []).map(req => ({
        ...req,
        attachments: req.attachments as Array<{ url: string; name: string; size: number }> | null
      })) as UpdateRequest[];
      setRequests(typedData);
    }
    setLoading(false);
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleOpenRequest = (request: UpdateRequest) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      internal_notes: request.internal_notes || ""
    });
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;

    const updates: any = {
      status: editForm.status,
      internal_notes: editForm.internal_notes
    };

    if (editForm.status === 'done' && !selectedRequest.completed_at) {
      updates.completed_at = new Date().toISOString();
    } else if (editForm.status !== 'done') {
      updates.completed_at = null;
    }

    const { error } = await supabase
      .from('update_requests')
      .update(updates)
      .eq('id', selectedRequest.id);

    if (error) {
      toast.error("Could not save changes");
    } else {
      toast.success("Request updated");
      setSelectedRequest(null);
      loadRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "default", label: "New" },
      in_progress: { variant: "secondary", label: "In progress" },
      waiting_on_client: { variant: "outline", label: "Waiting on client" },
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

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      low: { variant: "secondary", label: "Low" },
      normal: { variant: "default", label: "Normal" },
      high: { variant: "destructive", label: "High" }
    };

    const config = variants[priority] || { variant: "default", label: priority };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">All requests</h1>
            <p className="text-muted-foreground">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/clients')}>
              View clients
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/submissions')}>
              View submissions
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Log out
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No requests match the filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-4 font-semibold">Client</th>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Priority</th>
                      <th className="p-4 font-semibold">Quoted Price</th>
                      <th className="p-4 font-semibold">Created</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr 
                        key={request.id} 
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleOpenRequest(request)}
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{request.clients.business_name || request.clients.name}</div>
                            {request.clients.business_name && (
                              <div className="text-sm text-muted-foreground">{request.clients.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{request.title}</td>
                        <td className="p-4">{getStatusBadge(request.status)}</td>
                        <td className="p-4">{getPriorityBadge(request.priority)}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatQuotedPrice(request.size_tier, request.quoted_price_cents)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    {selectedRequest.clients.business_name && (
                      <p className="font-semibold text-lg">{selectedRequest.clients.business_name}</p>
                    )}
                    <p className="font-medium">{selectedRequest.clients.name}</p>
                    <a href={`mailto:${selectedRequest.clients.email}`} className="text-sm text-primary hover:underline">
                      {selectedRequest.clients.email}
                    </a>
                    {selectedRequest.clients.website_url && (
                      <div className="mt-1">
                        <a 
                          href={selectedRequest.clients.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center"
                        >
                          Visit website <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <p className="mt-1 text-lg font-medium">{selectedRequest.title}</p>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>

                {selectedRequest.ai_type && (
                  <Card className="bg-muted/20">
                    <CardContent className="pt-4">
                      <Label className="text-sm font-semibold">AI Classification</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <Badge variant={selectedRequest.ai_type === "free" ? "secondary" : "default"}>
                            {selectedRequest.ai_type?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">AI Estimated Price:</span>
                          <span className="font-medium">
                            {selectedRequest.ai_price_cents 
                              ? formatCurrency(selectedRequest.ai_price_cents)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <Badge variant={
                            selectedRequest.ai_confidence === "high" ? "default" : 
                            selectedRequest.ai_confidence === "medium" ? "secondary" : 
                            "outline"
                          }>
                            {selectedRequest.ai_confidence?.toUpperCase()}
                          </Badge>
                        </div>
                        {selectedRequest.ai_explanation && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground italic">
                              "{selectedRequest.ai_explanation}"
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div>
                    <Label>Attachments</Label>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:underline"
                        >
                          {attachment.name}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <p className="mt-1 capitalize">{selectedRequest.size_tier}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quoted price</Label>
                    <p className="mt-1 font-medium">
                      {formatQuotedPrice(selectedRequest.size_tier, selectedRequest.quoted_price_cents)}
                    </p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="mt-1">{format(new Date(selectedRequest.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="internal_notes">Internal notes</Label>
                  <Textarea
                    id="internal_notes"
                    rows={4}
                    value={editForm.internal_notes}
                    onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Close
                  </Button>
                  <Button onClick={handleSaveRequest}>
                    Save changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRequests;
