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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, dollarsToCents } from "@/lib/utils";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  website_url: string | null;
  plan_type: string;
  monthly_fee_cents: number;
  setup_fee_cents: number;
  monthly_included_minutes: number;
  active: boolean;
  pipeline_stage: string;
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
  estimated_minutes: number | null;
  actual_minutes: number | null;
  internal_notes: string | null;
}

const AdminClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  
  const [clientForm, setClientForm] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    website_url: "",
    plan_type: "build_only",
    setup_fee_dollars: 0,
    monthly_fee_dollars: 0,
    monthly_included_minutes: 30,
    active: true,
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    status: "",
    priority: "",
    actual_minutes: 0,
    internal_notes: "",
  });

  const [newRequestForm, setNewRequestForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    estimated_minutes: 15,
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
    setClientForm({
      name: clientData.name,
      business_name: clientData.business_name || "",
      email: clientData.email,
      phone: clientData.phone || "",
      website_url: clientData.website_url || "",
      plan_type: clientData.plan_type,
      setup_fee_dollars: clientData.setup_fee_cents / 100,
      monthly_fee_dollars: clientData.monthly_fee_cents / 100,
      monthly_included_minutes: clientData.monthly_included_minutes,
      active: clientData.active,
      notes: clientData.notes || "",
    });

    const { data: requestsData } = await supabase
      .from('update_requests')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    setRequests(requestsData || []);
    setLoading(false);
  };

  const handleSaveClient = async () => {
    const { error } = await supabase
      .from('clients')
      .update({
        name: clientForm.name,
        business_name: clientForm.business_name || null,
        email: clientForm.email,
        phone: clientForm.phone || null,
        website_url: clientForm.website_url || null,
        plan_type: clientForm.plan_type,
        setup_fee_cents: dollarsToCents(clientForm.setup_fee_dollars),
        monthly_fee_cents: dollarsToCents(clientForm.monthly_fee_dollars),
        monthly_included_minutes: clientForm.monthly_included_minutes,
        active: clientForm.active,
        notes: clientForm.notes || null,
      })
      .eq('id', id);

    if (error) {
      toast.error("Could not save client");
    } else {
      toast.success("Client saved");
      loadClientData();
    }
  };

  const handleOpenRequest = (request: UpdateRequest) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      priority: request.priority,
      actual_minutes: request.actual_minutes || 0,
      internal_notes: request.internal_notes || "",
    });
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;

    const updates: any = {
      status: editForm.status,
      priority: editForm.priority,
      actual_minutes: editForm.actual_minutes,
      internal_notes: editForm.internal_notes,
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

  const handleAddRequest = async () => {
    const { error } = await supabase.from('update_requests').insert({
      client_id: id,
      title: newRequestForm.title,
      description: newRequestForm.description,
      priority: newRequestForm.priority,
      estimated_minutes: newRequestForm.estimated_minutes,
      status: 'new',
    });

    if (error) {
      toast.error("Failed to create request");
    } else {
      toast.success("Request created");
      setAddRequestOpen(false);
      setNewRequestForm({
        title: "",
        description: "",
        priority: "normal",
        estimated_minutes: 15,
      });
      loadClientData();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "default", label: "New" },
      in_progress: { variant: "secondary", label: "In progress" },
      waiting_on_client: { variant: "outline", label: "Waiting on client" },
      done: { variant: "outline", label: "Done" },
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      normal: "default",
      high: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
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

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <Badge variant="secondary" className="capitalize">
            {client.pipeline_stage.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side - Client info */}
          <Card>
            <CardHeader>
              <CardTitle>Client information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="business_name">Business/Project name</Label>
                <Input
                  id="business_name"
                  value={clientForm.business_name}
                  onChange={(e) => setClientForm({ ...clientForm, business_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={clientForm.website_url}
                  onChange={(e) => setClientForm({ ...clientForm, website_url: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label htmlFor="plan_type">Plan type*</Label>
                  <Select
                    value={clientForm.plan_type}
                    onValueChange={(value) => setClientForm({ ...clientForm, plan_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="build_only">Build only</SelectItem>
                      <SelectItem value="care_plan">Care plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setup_fee">Setup fee ($)</Label>
                    <Input
                      id="setup_fee"
                      type="number"
                      value={clientForm.setup_fee_dollars}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, setup_fee_dollars: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly_fee">Monthly fee ($)</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      value={clientForm.monthly_fee_dollars}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, monthly_fee_dollars: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="monthly_included_minutes">Monthly included minutes</Label>
                  <Input
                    id="monthly_included_minutes"
                    type="number"
                    value={clientForm.monthly_included_minutes}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, monthly_included_minutes: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={clientForm.active}
                    onCheckedChange={(checked) => setClientForm({ ...clientForm, active: checked as boolean })}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Active client
                  </Label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Add internal notes about this client..."
                  className="min-h-[120px]"
                />
              </div>

              <Button onClick={handleSaveClient} className="w-full">
                Save client
              </Button>
            </CardContent>
          </Card>

          {/* Right side - Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Requests</CardTitle>
              <Button size="sm" onClick={() => setAddRequestOpen(true)}>
                Add request
              </Button>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-muted-foreground">No requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="text-right">Est. min</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow
                          key={request.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleOpenRequest(request)}
                        >
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(request.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {request.completed_at ? format(new Date(request.completed_at), "MMM d, yyyy") : "—"}
                          </TableCell>
                          <TableCell className="text-right">{request.estimated_minutes || "—"}</TableCell>
                          <TableCell className="text-right">{request.actual_minutes || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit request dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="text-sm">{selectedRequest.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="edit_priority">Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="actual_minutes">Actual minutes</Label>
                <Input
                  id="actual_minutes"
                  type="number"
                  value={editForm.actual_minutes}
                  onChange={(e) => setEditForm({ ...editForm, actual_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="internal_notes">Internal notes</Label>
                <Textarea
                  id="internal_notes"
                  value={editForm.internal_notes}
                  onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRequest}>Save changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add request dialog */}
      <Dialog open={addRequestOpen} onOpenChange={setAddRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_title">Title*</Label>
              <Input
                id="new_title"
                value={newRequestForm.title}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new_description">Description*</Label>
              <Textarea
                id="new_description"
                value={newRequestForm.description}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_priority">Priority</Label>
                <Select
                  value={newRequestForm.priority}
                  onValueChange={(value) => setNewRequestForm({ ...newRequestForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimated_minutes">Estimated minutes</Label>
                <Input
                  id="estimated_minutes"
                  type="number"
                  value={newRequestForm.estimated_minutes}
                  onChange={(e) =>
                    setNewRequestForm({ ...newRequestForm, estimated_minutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRequest}>Add request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientDetail;
