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
  setup_fee_cents: number;
  active: boolean;
  pipeline_stage: string;
  notes: string | null;
  auth_user_id: string | null;
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
  size_tier: string;
  quoted_price_cents: number | null;
  ai_type: string | null;
  ai_price_cents: number | null;
  ai_explanation: string | null;
  ai_confidence: string | null;
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
    setup_fee_dollars: 0,
    active: true,
    notes: "",
    auth_user_id: null as string | null,
  });

  const [portalAccessLoading, setPortalAccessLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

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
    size_tier: "small",
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
      setup_fee_dollars: clientData.setup_fee_cents / 100,
      active: clientData.active,
      notes: clientData.notes || "",
      auth_user_id: clientData.auth_user_id,
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
        setup_fee_cents: dollarsToCents(clientForm.setup_fee_dollars),
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

  const calculateQuotedPrice = (sizeTier: string): number | null => {
    switch (sizeTier) {
      case 'tiny': return 0;
      case 'small': return 5000;
      case 'medium': return 10000;
      case 'large': return null;
      default: return 5000;
    }
  };

  const formatQuotedPrice = (sizeTier: string, quotedPriceCents: number | null) => {
    if (sizeTier === 'tiny') return 'Free';
    if (sizeTier === 'large' || quotedPriceCents === null) return 'Quote pending';
    return formatCurrency(quotedPriceCents);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreatePortalAccess = async () => {
    if (!client) return;
    
    setPortalAccessLoading(true);
    
    try {
      const tempPass = generatePassword();
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: client.email,
        password: tempPass,
        email_confirm: true,
        user_metadata: {
          name: client.name,
          created_by_admin: true
        }
      });
      
      if (authError) throw authError;
      
      // Update client record with auth_user_id
      const { error: updateError } = await supabase
        .from('clients')
        .update({ auth_user_id: authData.user.id })
        .eq('id', client.id);
      
      if (updateError) throw updateError;
      
      setTempPassword(tempPass);
      setShowPasswordDialog(true);
      
      toast.success("Portal access created!");
      loadClientData();
      
    } catch (error: any) {
      console.error('Error creating portal access:', error);
      toast.error(error.message || "Failed to create portal access");
    } finally {
      setPortalAccessLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!client) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        client.email,
        { redirectTo: `${window.location.origin}/portal` }
      );
      
      if (error) throw error;
      
      toast.success(`Password reset email sent to ${client.email}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset");
    }
  };

  const handleAddRequest = async () => {
    const { error } = await supabase.from('update_requests').insert({
      client_id: id,
      title: newRequestForm.title,
      description: newRequestForm.description,
      priority: newRequestForm.priority,
      estimated_minutes: newRequestForm.estimated_minutes,
      size_tier: newRequestForm.size_tier,
      quoted_price_cents: calculateQuotedPrice(newRequestForm.size_tier),
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
        size_tier: "small",
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

              <div className="border-t pt-4">
                <Label>Portal Access</Label>
                {clientForm.auth_user_id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" className="bg-green-600">Portal access: Active</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSendPasswordReset}
                    >
                      Send password reset
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleCreatePortalAccess}
                    variant="outline"
                    className="mt-2 w-full"
                    disabled={portalAccessLoading}
                  >
                    {portalAccessLoading ? "Creating..." : "Create portal access"}
                  </Button>
                )}
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
                        <TableHead>Price</TableHead>
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
                          <TableCell className="text-sm text-muted-foreground">
                            {formatQuotedPrice(request.size_tier, request.quoted_price_cents)}
                          </TableCell>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size tier</Label>
                  <p className="text-sm capitalize">{selectedRequest.size_tier}</p>
                </div>
                <div>
                  <Label>Quoted price</Label>
                  <p className="text-sm font-medium">
                    {formatQuotedPrice(selectedRequest.size_tier, selectedRequest.quoted_price_cents)}
                  </p>
                </div>
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
                <Label htmlFor="new_size_tier">Size</Label>
                <Select
                  value={newRequestForm.size_tier}
                  onValueChange={(value) => setNewRequestForm({ ...newRequestForm, size_tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiny">Tiny (Free)</SelectItem>
                    <SelectItem value="small">Small ($50)</SelectItem>
                    <SelectItem value="medium">Medium ($100)</SelectItem>
                    <SelectItem value="large">Large (Manual quote)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRequest}>Add request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password display dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Portal Access Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Portal access has been created for <strong>{client?.email}</strong>
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-xs uppercase text-muted-foreground">Temporary Password</Label>
              <p className="text-lg font-mono font-semibold mt-1 select-all">
                {tempPassword}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Send this password to your client. They can log in at{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {window.location.origin}/portal
              </code>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${client?.email}\nPassword: ${tempPassword}\nLogin: ${window.location.origin}/portal`);
                  toast.success("Credentials copied to clipboard");
                }}
              >
                Copy credentials
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowPasswordDialog(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientDetail;
