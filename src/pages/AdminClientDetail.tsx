import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  website_url: string | null;
  plan_type: string;
  monthly_included_minutes: number;
  created_at: string;
  notes: string | null;
}

interface UpdateRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
  estimated_minutes: number;
  actual_minutes: number;
  internal_notes: string | null;
}

const AdminClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    actual_minutes: 0,
    internal_notes: ""
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin && id) {
      loadClientData();
    }
  }, [isAdmin, id]);

  const loadClientData = async () => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      console.error('Error loading client:', clientError);
      navigate('/admin/clients');
      return;
    }

    setClient(clientData);
    setNotes(clientData.notes || "");

    const { data: requestsData } = await supabase
      .from('update_requests')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    setRequests(requestsData || []);
    setLoading(false);
  };

  const handleSaveNotes = async () => {
    const { error } = await supabase
      .from('clients')
      .update({ notes })
      .eq('id', id);

    if (error) {
      toast.error("Could not save notes");
    } else {
      toast.success("Notes saved");
    }
  };

  const handleOpenRequest = (request: UpdateRequest) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      actual_minutes: request.actual_minutes,
      internal_notes: request.internal_notes || ""
    });
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;

    const updates: any = {
      status: editForm.status,
      actual_minutes: editForm.actual_minutes,
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
      loadClientData();
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin || !client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin/clients')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to clients
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Business/Project</Label>
                <p>{client.business_name || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p>
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                    {client.email}
                  </a>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p>{client.phone || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <p>
                  {client.website_url ? (
                    <a
                      href={client.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {client.website_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Plan</Label>
                <p>{client.plan_type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Monthly included minutes</Label>
                <p>{client.monthly_included_minutes}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(client.created_at).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this client..."
                  className="min-h-[120px]"
                />
                <Button onClick={handleSaveNotes} size="sm">
                  Save notes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-muted-foreground">No requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => handleOpenRequest(request)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                            {request.completed_at && ` • Done ${new Date(request.completed_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-muted-foreground">{request.actual_minutes}m</span>
                          <span className={`px-2 py-0.5 rounded ${
                            request.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            request.status === 'in_progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {request.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm">{selectedRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <p className="capitalize">{selectedRequest.priority}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="waiting_on_client">Waiting on client</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual_minutes">Actual minutes</Label>
                  <Input
                    id="actual_minutes"
                    type="number"
                    value={editForm.actual_minutes}
                    onChange={(e) => setEditForm({ ...editForm, actual_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={editForm.internal_notes}
                    onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                    placeholder="Notes for myself only..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
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
  );
};

export default AdminClientDetail;
