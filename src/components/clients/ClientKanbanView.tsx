import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientKanbanColumn } from "./ClientKanbanColumn";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  pipeline_stage: string;
  open_requests_count?: number;
}

interface ClientKanbanViewProps {
  clients: Client[];
  onUpdate: () => void;
}

const stages = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "build", label: "Build" },
  { id: "launched", label: "Launched" },
  { id: "care_plan", label: "Care plan" },
  { id: "lost", label: "Lost" },
];

export const ClientKanbanView = ({ clients, onUpdate }: ClientKanbanViewProps) => {
  const navigate = useNavigate();
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    
    const clientId = e.dataTransfer.getData("clientId");
    if (!clientId) return;

    const { error } = await supabase
      .from("clients")
      .update({ pipeline_stage: newStage })
      .eq("id", clientId);

    if (error) {
      toast.error("Failed to update pipeline stage");
    } else {
      toast.success("Pipeline stage updated");
      onUpdate();
    }

    setDraggedClient(null);
  };

  const getClientsForStage = (stageId: string) => {
    return clients.filter((client) => client.pipeline_stage === stageId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {stages.map((stage) => (
        <ClientKanbanColumn
          key={stage.id}
          stage={stage}
          clients={getClientsForStage(stage.id)}
          onClientClick={(id) => navigate(`/admin/clients/${id}`)}
          onDrop={handleDrop}
          setDraggedClient={setDraggedClient}
        />
      ))}
    </div>
  );
};
