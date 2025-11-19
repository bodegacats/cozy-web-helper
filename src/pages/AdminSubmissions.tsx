import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { dollarsToCents } from "@/lib/utils";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  project_description: string;
  website_url: string | null;
  wish: string;
  created_at: string;
  status: string;
}

const AdminSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    website_url: "",
    notes: "",
    plan_type: "build_only",
    setup_fee_dollars: 1500,
    monthly_fee_dollars: 0,
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleOpenConvertDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setClientForm({
      name: submission.name,
      email: submission.email,
      website_url: submission.website_url || "",
      notes: `${submission.project_description}\n\n${submission.wish}`,
      plan_type: "build_only",
      setup_fee_dollars: 1500,
      monthly_fee_dollars: 0,
    });
    setConvertDialogOpen(true);
  };

  const handleCreateClient = async () => {
    if (!selectedSubmission) return;

    // Check if client already exists
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", clientForm.email)
      .maybeSingle();

    if (existing) {
      toast.error("A client with this email already exists");
      return;
    }

    // Create client
    const { error } = await supabase.from("clients").insert({
      name: clientForm.name,
      email: clientForm.email,
      website_url: clientForm.website_url || null,
      notes: clientForm.notes,
      plan_type: clientForm.plan_type,
      setup_fee_cents: dollarsToCents(clientForm.setup_fee_dollars),
      monthly_fee_cents: dollarsToCents(clientForm.monthly_fee_dollars),
      pipeline_stage: "lead",
      source_submission_id: selectedSubmission.id,
    });

    if (error) {
      toast.error("Failed to create client");
      return;
    }

    // Update submission status
    await supabase
      .from("contact_submissions")
      .update({ status: "converted" })
      .eq("id", selectedSubmission.id);

    toast.success("Client created successfully");
    setConvertDialogOpen(false);
    fetchSubmissions();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      replied: "secondary",
      not_fit: "outline",
      converted: "outline",
    };
    
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contact Submissions</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/admin/clients'} variant="outline">
                View clients
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Log Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Wish</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>
                          <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {truncateText(submission.project_description, 80)}
                        </TableCell>
                        <TableCell>
                          {submission.website_url ? (
                            <a
                              href={submission.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            {expandedId === submission.id ? (
                              <div>
                                <p className="whitespace-pre-wrap">{submission.wish}</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => setExpandedId(null)}
                                  className="p-0 h-auto"
                                >
                                  Show less
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <p>{truncateText(submission.wish, 100)}</p>
                                {submission.wish.length > 100 && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setExpandedId(submission.id)}
                                    className="p-0 h-auto"
                                  >
                                    Show more
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(submission.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {submission.status !== "converted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenConvertDialog(submission)}
                            >
                              Create client
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create client from submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
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
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={clientForm.website_url}
                onChange={(e) => setClientForm({ ...clientForm, website_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient}>Create client</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;
