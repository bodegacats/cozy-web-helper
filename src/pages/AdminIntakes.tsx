import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { IntakeDetailDialog } from "@/components/kanban/IntakeDetailDialog";

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
  created_at: string;
}

const STAGES = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "needs_content", label: "Needs Content" },
  { id: "ready_to_build", label: "Ready to Build" },
  { id: "in_build", label: "In Build" },
  { id: "waiting_on_client", label: "Waiting on Client" },
  { id: "done", label: "Done" },
];

const AdminIntakes = () => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchIntakes();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roles || roles.role !== "admin") {
      toast.error("Access denied");
      navigate("/");
    }
  };

  const fetchIntakes = async () => {
    try {
      const { data, error } = await supabase
        .from("project_intakes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntakes((data || []) as Intake[]);
    } catch (error) {
      console.error("Error fetching intakes:", error);
      toast.error("Failed to load intakes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const intakeId = active.id as string;
    const newStage = over.id as string;

    // Optimistic update
    setIntakes((prev) =>
      prev.map((intake) =>
        intake.id === intakeId ? { ...intake, kanban_stage: newStage } : intake
      )
    );

    try {
      const { error } = await supabase
        .from("project_intakes")
        .update({ kanban_stage: newStage })
        .eq("id", intakeId);

      if (error) throw error;
      toast.success("Stage updated");
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Failed to update stage");
      fetchIntakes(); // Revert on error
    }
  };

  const handleUpdateIntake = async (updatedIntake: Partial<Intake>) => {
    if (!selectedIntake) return;

    try {
      const { error } = await supabase
        .from("project_intakes")
        .update(updatedIntake)
        .eq("id", selectedIntake.id);

      if (error) throw error;

      setIntakes((prev) =>
        prev.map((intake) =>
          intake.id === selectedIntake.id
            ? { ...intake, ...updatedIntake }
            : intake
        )
      );

      setSelectedIntake({ ...selectedIntake, ...updatedIntake } as Intake);
      toast.success("Intake updated");
    } catch (error) {
      console.error("Error updating intake:", error);
      toast.error("Failed to update intake");
    }
  };

  const handleCreateRequest = async (clientId: string, title: string, description: string) => {
    try {
      const { error } = await supabase.from("update_requests").insert({
        client_id: clientId,
        title,
        description,
        status: "new",
        priority: "normal",
        size_tier: "small",
      });

      if (error) throw error;

      toast.success("Request created");
      setSelectedIntake(null);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    }
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
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">AI Intakes</h1>
          <p className="text-muted-foreground">
            Leads collected by the intake assistant. Drag cards through the pipeline as you work them.
          </p>
        </div>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {STAGES.map((stage) => {
              const stageIntakes = intakes.filter(
                (intake) => intake.kanban_stage === stage.id
              );

              return (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  intakes={stageIntakes}
                  onIntakeClick={setSelectedIntake}
                />
              );
            })}
          </div>
        </DndContext>
      </div>

      <IntakeDetailDialog
        intake={selectedIntake}
        onClose={() => setSelectedIntake(null)}
        onUpdate={handleUpdateIntake}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  );
};

export default AdminIntakes;