import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Loader2, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string | null;
  created_at: string | null;
  business_name: string | null;
  business_description: string | null;
  website_url: string | null;
  goals: string | null;
  timeline: string | null;
  budget_range: string | null;
  content_readiness: string | null;
  tech_comfort: string | null;
  design_prompt: string | null;
  vibe_description: string | null;
  inspiration_sites: string | null;
  color_preferences: string | null;
  page_count: number | null;
  content_shaping: boolean | null;
  rush: boolean | null;
  estimated_price: number | null;
  special_needs: string | null;
  fit_status: string | null;
  suggested_tier: string | null;
  raw_summary: string | null;
  wish: string | null;
  project_notes: string | null;
  discount_offered: boolean | null;
  discount_amount: number | null;
  lead_score: number | null;
  converted_to_client_id: string | null;
  converted_at: string | null;
  project_description?: string;
  submission_type?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  created_at: string | null;
  status: string;
  wish: string;
  project_description: string;
  website_url: string | null;
  submission_type: string;
  estimate_low: number | null;
  estimate_high: number | null;
  selected_options: any;
  notes: string | null;
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchLeads();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/portal");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roles || roles.role !== "admin") {
      toast.error("Access denied");
      navigate("/portal");
    }
  };

  const fetchLeads = async () => {
    // Fetch from leads table
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch from contact_submissions table
    const { data: submissionsData, error: submissionsError } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadsError) {
      toast.error("Failed to fetch leads");
      console.error(leadsError);
    }
    
    if (submissionsError) {
      toast.error("Failed to fetch submissions");
      console.error(submissionsError);
    }

    // Normalize contact submissions to lead format
    const normalizedSubmissions: Lead[] = (submissionsData || []).map((sub: ContactSubmission) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      source: sub.submission_type || "contact",
      status: sub.status,
      created_at: sub.created_at,
      business_name: null,
      business_description: null,
      website_url: sub.website_url,
      goals: null,
      timeline: null,
      budget_range: null,
      content_readiness: null,
      tech_comfort: null,
      design_prompt: null,
      vibe_description: null,
      inspiration_sites: null,
      color_preferences: null,
      page_count: null,
      content_shaping: null,
      rush: null,
      estimated_price: sub.estimate_low || sub.estimate_high || null,
      special_needs: null,
      fit_status: null,
      suggested_tier: null,
      raw_summary: null,
      wish: sub.wish,
      project_notes: sub.notes,
      discount_offered: null,
      discount_amount: null,
      lead_score: null,
      converted_to_client_id: null,
      converted_at: null,
      project_description: sub.project_description,
      submission_type: sub.submission_type,
    }));

    // Combine both datasets
    const allLeads = [...(leadsData || []), ...normalizedSubmissions];
    setLeads(allLeads);
    setLoading(false);
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const table = lead.source === "contact" ? "contact_submissions" : "leads";
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    toast.success("Status updated");
  };

  const handleConvertToClient = async (lead: Lead) => {
    const { data: existingClients } = await supabase
      .from("clients")
      .select("id")
      .eq("email", lead.email)
      .maybeSingle();

    if (existingClients) {
      toast.error("A client with this email already exists");
      return;
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name: lead.name,
        email: lead.email,
        business_name: lead.business_name,
        website_url: lead.website_url,
        notes: lead.project_notes,
        source_lead_id: lead.source === "contact" ? null : lead.id,
        source_submission_id: lead.source === "contact" ? lead.id : null,
      })
      .select()
      .single();

    if (clientError) {
      toast.error("Failed to create client");
      return;
    }

    // Update the appropriate table
    if (lead.source === "contact") {
      const { error: updateError } = await supabase
        .from("contact_submissions")
        .update({ status: "converted" })
        .eq("id", lead.id);

      if (updateError) {
        toast.error("Failed to update submission status");
        return;
      }
    } else {
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          status: "converted",
          converted_to_client_id: client.id,
          converted_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (updateError) {
        toast.error("Failed to update lead status");
        return;
      }
    }

    toast.success("Lead converted to client successfully");
    navigate(`/admin/clients/${client.id}`);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;

    const leadToDeleteObj = leads.find(l => l.id === leadToDelete);
    if (!leadToDeleteObj) return;

    // Delete from the appropriate table
    const table = leadToDeleteObj.source === "contact" ? "contact_submissions" : "leads";
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", leadToDelete);

    if (error) {
      toast.error("Failed to delete lead");
      return;
    }

    toast.success("Lead deleted successfully");
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
    fetchLeads();
  };

  const handleBulkDelete = async () => {
    const leadsArray = Array.from(selectedLeads);
    const selectedLeadObjs = leads.filter(l => leadsArray.includes(l.id));
    
    // Group by source type
    const contactLeads = selectedLeadObjs.filter(l => l.source === "contact").map(l => l.id);
    const regularLeads = selectedLeadObjs.filter(l => l.source !== "contact").map(l => l.id);

    let hasError = false;

    if (contactLeads.length > 0) {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .in("id", contactLeads);
      if (error) hasError = true;
    }

    if (regularLeads.length > 0) {
      const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", regularLeads);
      if (error) hasError = true;
    }

    if (hasError) {
      toast.error("Failed to delete some leads");
    } else {
      toast.success(`Successfully deleted ${leadsArray.length} lead(s)`);
    }

    setSelectedLeads(new Set());
    setDeleteDialogOpen(false);
    fetchLeads();
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)));
    }
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      quote: { variant: "default", label: "Quote Form" },
      ai_intake: { variant: "secondary", label: "AI Intake" },
      checkup: { variant: "outline", label: "Checkup" },
      contact: { variant: "outline", label: "Contact Form" },
    };

    const config = variants[source] || { variant: "outline", label: source };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">new</Badge>;
    
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      new: "default",
      reviewed: "secondary",
      contacted: "secondary",
      qualified: "outline",
      converted: "outline",
      not_fit: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSource && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>Leads | Admin</title>
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track potential clients from all sources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/clients')}>
              View Clients
            </Button>
            {selectedLeads.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Selected ({selectedLeads.size})
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Source:</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">All Sources</option>
              <option value="quote">Quote Form</option>
              <option value="contact">Contact Form</option>
              <option value="ai_intake">AI Intake</option>
              <option value="checkup">Checkup</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="not_fit">Not Fit</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.name}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.email}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {getSourceBadge(lead.source)}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.estimated_price
                        ? `$${(lead.estimated_price / 100).toFixed(0)}`
                        : "—"}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {lead.created_at && format(new Date(lead.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeadToDelete(lead.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Lead Details</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  {getSourceBadge(selectedLead.source)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{selectedLead.created_at && format(new Date(selectedLead.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-2 block">Lead Status</Label>
                <Select
                  value={selectedLead.status || "new"}
                  onValueChange={(value) => handleStatusUpdate(selectedLead.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="not_fit">Not a Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedLead.wish && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">What they wish for</p>
                    <p>{selectedLead.wish}</p>
                  </div>
                </>
              )}

              {selectedLead.project_description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Project Description</p>
                    <p>{selectedLead.project_description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleConvertToClient(selectedLead)}
                  disabled={selectedLead.status === "converted"}
                >
                  Convert to Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedLead(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead{selectedLeads.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedLeads.size > 1 
                ? `Are you sure you want to delete ${selectedLeads.size} leads? This action cannot be undone.`
                : "Are you sure you want to delete this lead? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={selectedLeads.size > 1 ? handleBulkDelete : handleDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLeads;
