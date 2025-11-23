import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Copy, Check, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_INTAKES_TABLE } from "@/constants/tables";

interface Intake {
  id: string;
  client_id: string | null;
  name: string;
  email: string;
  business_name: string | null;
  project_description: string | null;
  goals: string | null;
  pages_estimate: number | null;
  content_readiness: string | null;
  timeline: string | null;
  budget_range: string | null;
  design_examples: string | null;
  special_needs: string | null;
  tech_comfort: string | null;
  fit_status: "good" | "borderline" | "not_fit";
  suggested_tier: "500" | "1000" | "1500" | null;
  kanban_stage: string;
  raw_summary: string | null;
  raw_conversation: any;
  lovable_build_prompt: string | null;
  source: string | null;
  discount_offered: boolean | null;
  discount_amount: number | null;
  created_at: string;
}

interface IntakeDetailDialogProps {
  intake: Intake | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Intake>) => void;
  onCreateRequest: (clientId: string, title: string, description: string) => void;
  onDelete?: () => void;
}

export const IntakeDetailDialog = ({
  intake,
  onClose,
  onUpdate,
  onCreateRequest,
  onDelete,
}: IntakeDetailDialogProps) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  if (!intake) return null;

  const handleCreateRequest = () => {
    if (intake.client_id && requestTitle && requestDescription) {
      onCreateRequest(intake.client_id, requestTitle, requestDescription);
      setShowRequestForm(false);
      setRequestTitle("");
      setRequestDescription("");
    }
  };

  const handleCopyPrompt = async () => {
    if (intake.lovable_build_prompt) {
      await navigator.clipboard.writeText(intake.lovable_build_prompt);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteIntake = async () => {
    if (!intake) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from(PROJECT_INTAKES_TABLE)
        .delete()
        .eq("id", intake.id);

      if (error) throw error;

      toast.success("Intake deleted");
      setShowDeleteDialog(false);
      onClose();
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting intake:", error);
      toast.error("Failed to delete intake");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!intake} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{intake.business_name || intake.name}</span>
            {intake.client_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/clients/${intake.client_id}`)}
              >
                View Client <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Source</Label>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">
                  {intake.source?.replace(/_/g, " ") || "ai intake"}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Submitted</Label>
              <p className="text-sm mt-2 text-muted-foreground">
                {new Date(intake.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <Label>Discount</Label>
              <p className="text-sm mt-2">
                {intake.discount_offered
                  ? `-$${intake.discount_amount || 0} courtesy`
                  : "No discount offered"}
              </p>
            </div>
          </div>

          {/* Lovable Build Prompt */}
          {intake.lovable_build_prompt && (
            <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">🚀 Lovable Build Prompt</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={intake.lovable_build_prompt}
                readOnly
                className="min-h-[200px] font-mono text-xs bg-background"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Copy this prompt and paste it into Lovable to start building.
              </p>
            </div>
          )}

          {/* Status Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Fit Status</Label>
              <Select
                value={intake.fit_status}
                onValueChange={(value) => onUpdate({ fit_status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">✅ Good</SelectItem>
                  <SelectItem value="borderline">⚠️ Borderline</SelectItem>
                  <SelectItem value="not_fit">❌ Not a Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Suggested Tier</Label>
              <Select
                value={intake.suggested_tier || ""}
                onValueChange={(value) => onUpdate({ suggested_tier: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="1500">$1,500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stage</Label>
              <Select
                value={intake.kanban_stage}
                onValueChange={(value) => onUpdate({ kanban_stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="needs_content">Needs Content</SelectItem>
                  <SelectItem value="ready_to_build">Ready to Build</SelectItem>
                  <SelectItem value="in_build">In Build</SelectItem>
                  <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          {intake.raw_summary && (
            <div>
              <Label>AI Summary</Label>
              <div className="p-4 bg-muted rounded-lg mt-2">
                <p className="text-sm whitespace-pre-wrap">{intake.raw_summary}</p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm mt-1">{intake.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm mt-1">{intake.email}</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <Label>What they do</Label>
              <p className="text-sm mt-1">{intake.project_description || "N/A"}</p>
            </div>

            <div>
              <Label>Goals</Label>
              <p className="text-sm mt-1">{intake.goals || "N/A"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pages Needed</Label>
                <p className="text-sm mt-1">{intake.pages_estimate || "Not specified"}</p>
              </div>
              <div>
                <Label>Budget Range</Label>
                <p className="text-sm mt-1">{intake.budget_range || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Content Readiness</Label>
                <p className="text-sm mt-1">{intake.content_readiness || "N/A"}</p>
              </div>
              <div>
                <Label>Timeline</Label>
                <p className="text-sm mt-1">{intake.timeline || "N/A"}</p>
              </div>
            </div>

            <div>
              <Label>Special Needs</Label>
              <p className="text-sm mt-1">{intake.special_needs || "None mentioned"}</p>
            </div>

            <div>
              <Label>Tech Comfort</Label>
              <p className="text-sm mt-1">{intake.tech_comfort || "N/A"}</p>
            </div>

            {intake.design_examples && (
              <div>
                <Label>Design Examples</Label>
                <p className="text-sm mt-1">{intake.design_examples}</p>
              </div>
            )}
          </div>

          {/* Conversation History */}
          {intake.raw_conversation && (
            <div>
              <Label>Conversation</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                {Array.isArray(intake.raw_conversation) ? (
                  <div className="space-y-2">
                    {intake.raw_conversation.map((msg: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <strong>{msg.role === "user" ? "Them" : "AI"}:</strong>{" "}
                        {msg.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">No conversation history</p>
                )}
              </div>
            </div>
          )}

          {/* Create Request */}
          {intake.client_id && (
            <div className="pt-4 border-t">
              {!showRequestForm ? (
                <Button onClick={() => setShowRequestForm(true)} className="w-full">
                  Create Request for This Client
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Request Title</Label>
                    <Input
                      value={requestTitle}
                      onChange={(e) => setRequestTitle(e.target.value)}
                      placeholder="e.g., Build new website"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="Details from intake..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateRequest} className="flex-1">
                      Create Request
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Intake
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intake?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the intake for{" "}
              <span className="font-semibold">{intake?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIntake}
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
    </Dialog>
  );
};