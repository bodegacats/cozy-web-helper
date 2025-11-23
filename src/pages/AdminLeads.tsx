import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  created_at: string;
  name: string;
  email: string;
  source: string;
  page_count: number | null;
  content_shaping: boolean | null;
  rush: boolean | null;
  estimated_price: number | null;
  business_name: string | null;
  business_description: string | null;
  project_notes: string | null;
  website_url: string | null;
  vibe_description: string | null;
  inspiration_sites: string | null;
  color_preferences: string | null;
  design_prompt: string | null;
  goals: string | null;
  content_readiness: string | null;
  timeline: string | null;
  budget_range: string | null;
  special_needs: string | null;
  tech_comfort: string | null;
  fit_status: string | null;
  suggested_tier: string | null;
  raw_summary: string | null;
  wish: string | null;
  status: string;
  converted_to_client_id: string | null;
  converted_at: string | null;
  discount_offered: boolean | null;
  discount_amount: number | null;
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedLead) return;

    setIsConverting(true);
    try {
      // Create client record
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: selectedLead.name,
          email: selectedLead.email,
          business_name: selectedLead.business_name,
          website_url: selectedLead.website_url,
          notes: selectedLead.business_description || selectedLead.project_notes,
          source_lead_id: selectedLead.id,
          pipeline_stage: "lead",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Update lead to mark as converted
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          status: "converted",
          converted_to_client_id: clientData.id,
          converted_at: new Date().toISOString(),
        })
        .eq("id", selectedLead.id);

      if (updateError) throw updateError;

      toast.success("Lead converted to client!");
      setSelectedLead(null);
      fetchLeads();

      // Navigate to client detail page
      navigate(`/admin/clients/${clientData.id}`);
    } catch (error: any) {
      console.error("Error converting lead:", error);
      if (error.message?.includes("duplicate key")) {
        toast.error("A client with this email already exists");
      } else {
        toast.error("Failed to convert lead to client");
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadToDelete.id);

      if (error) throw error;

      toast.success("Lead deleted");
      setLeads((prev) => prev.filter((lead) => lead.id !== leadToDelete.id));
      setLeadToDelete(null);
      
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      ai_intake: { variant: "default", label: "AI Intake" },
      quote: { variant: "secondary", label: "Quote" },
      checkup: { variant: "outline", label: "Checkup" },
      contact: { variant: "outline", label: "Contact" },
    };

    const config = variants[source] || { variant: "outline" as const, label: source };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>Leads | Admin</title>
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Leads Pipeline</h1>
            <p className="text-muted-foreground">
              All lead submissions from AI intake, quote forms, checkups, and contact forms.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/clients")}>
            View Clients
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No leads yet
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
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
                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(lead);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              {/* Header Info */}
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
                  <p>{format(new Date(selectedLead.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              <Separator />

              {/* Status Management */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Lead Status</Label>
                <Select
                  value={selectedLead.status}
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

              {/* Pricing Info */}
              {(selectedLead.estimated_price || selectedLead.page_count || selectedLead.discount_offered) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Pricing Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLead.estimated_price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Price</p>
                          <p className="text-xl font-semibold">
                            ${(selectedLead.estimated_price / 100).toFixed(0)}
                          </p>
                        </div>
                      )}
                      {selectedLead.discount_offered && (
                        <div>
                          <p className="text-sm text-muted-foreground">Discount Offered</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-base">
                              ${selectedLead.discount_amount}
                            </Badge>
                            {selectedLead.estimated_price && selectedLead.discount_amount && (
                              <p className="text-sm text-muted-foreground">
                                (Final: ${((selectedLead.estimated_price / 100) - selectedLead.discount_amount).toFixed(0)})
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedLead.page_count && (
                        <div>
                          <p className="text-sm text-muted-foreground">Page Count</p>
                          <p className="font-medium">{selectedLead.page_count} pages</p>
                        </div>
                      )}
                      {selectedLead.content_shaping && (
                        <div>
                          <Badge variant="secondary">Content Shaping</Badge>
                        </div>
                      )}
                      {selectedLead.rush && (
                        <div>
                          <Badge variant="secondary">Rush Delivery</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Business Info */}
              {(selectedLead.business_name || selectedLead.business_description || selectedLead.website_url) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Business Information</h3>
                    <div className="space-y-3">
                      {selectedLead.business_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Business Name</p>
                          <p>{selectedLead.business_name}</p>
                        </div>
                      )}
                      {selectedLead.business_description && (
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="whitespace-pre-wrap">{selectedLead.business_description}</p>
                        </div>
                      )}
                      {selectedLead.website_url && (
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <a
                            href={selectedLead.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {selectedLead.website_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* AI Intake Specific */}
              {selectedLead.source === "ai_intake" && selectedLead.design_prompt && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">AI-Generated Design Prompt</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLead.design_prompt || "");
                          toast.success("Build prompt copied to clipboard!");
                        }}
                      >
                        Copy Build Prompt
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {selectedLead.design_prompt}
                      </pre>
                    </div>
                  </div>
                </>
              )}

              {/* Checkup Specific */}
              {selectedLead.source === "checkup" && selectedLead.wish && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">What They Want</h3>
                    <p className="whitespace-pre-wrap">{selectedLead.wish}</p>
                  </div>
                </>
              )}

              {/* Notes */}
              {selectedLead.project_notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Additional Notes</h3>
                    <p className="whitespace-pre-wrap">{selectedLead.project_notes}</p>
                  </div>
                </>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setLeadToDelete(selectedLead);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
                    Close
                  </Button>
                  {selectedLead.status !== "converted" && (
                  <Button onClick={handleConvertToClient} disabled={isConverting}>
                    {isConverting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Convert to Client
                  </Button>
                )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead for{" "}
              <span className="font-semibold">{leadToDelete?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLeads;
