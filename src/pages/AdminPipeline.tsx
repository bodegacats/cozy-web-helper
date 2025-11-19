import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  plan_type: string;
  monthly_fee_cents: number;
  pipeline_stage: string;
  open_requests_count?: number;
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

const AdminPipeline = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadClients();
    }
  }, [isAdmin]);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load clients");
      return;
    }

    // Load open requests count for each client
    const clientsWithCounts = await Promise.all(
      (data || []).map(async (client) => {
        const { count } = await supabase
          .from("update_requests")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.id)
          .neq("status", "done");

        return { ...client, open_requests_count: count || 0 };
      })
    );

    setClients(clientsWithCounts);
    setLoading(false);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    
    const clientId = e.dataTransfer.getData("clientId");
    if (!clientId) return;

    // Update local state optimistically
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, pipeline_stage: newStage } : client
      )
    );

    // Update database
    const { error } = await supabase
      .from("clients")
      .update({ pipeline_stage: newStage })
      .eq("id", clientId);

    if (error) {
      toast.error("Failed to update pipeline stage");
      loadClients(); // Reload on error
    } else {
      toast.success("Pipeline stage updated");
    }

    setDraggedClient(null);
  };

  const getClientsForStage = (stageId: string) => {
    return clients.filter((client) => client.pipeline_stage === stageId);
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
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/clients')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to clients
            </Button>
            <h1 className="text-2xl font-semibold">Pipeline</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              clients={getClientsForStage(stage.id)}
              navigate={navigate}
              onDrop={handleDrop}
              setDraggedClient={setDraggedClient}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PipelineColumnProps {
  stage: { id: string; label: string };
  clients: Client[];
  navigate: (path: string) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  setDraggedClient: (client: Client | null) => void;
}

const PipelineColumn = ({ stage, clients, navigate, onDrop, setDraggedClient }: PipelineColumnProps) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-medium text-sm">{stage.label}</h3>
        <Badge variant="secondary" className="text-xs">
          {clients.length}
        </Badge>
      </div>
      
      <div
        className={`flex-1 rounded-lg p-2 min-h-[200px] space-y-2 transition-colors ${
          isOver ? "bg-primary/10 border-2 border-primary border-dashed" : "bg-muted/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          onDrop(e, stage.id);
        }}
      >
        {clients.map((client) => (
          <DraggableClientCard
            key={client.id}
            client={client}
            navigate={navigate}
            setDraggedClient={setDraggedClient}
          />
        ))}
      </div>
    </div>
  );
};

interface DraggableClientCardProps {
  client: Client;
  navigate: (path: string) => void;
  setDraggedClient: (client: Client | null) => void;
}

const DraggableClientCard = ({ client, navigate, setDraggedClient }: DraggableClientCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        setDraggedClient(client);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("clientId", client.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setDraggedClient(null);
      }}
      className={isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"}
    >
      <ClientCard client={client} onClick={() => navigate(`/admin/clients/${client.id}`)} />
    </div>
  );
};

interface ClientCardProps {
  client: Client;
  isDragging?: boolean;
  onClick?: () => void;
}

const ClientCard = ({ client, onClick }: ClientCardProps) => {
  return (
    <Card
      className="hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div>
          <h4 className="font-medium text-sm">{client.name}</h4>
          {client.business_name && (
            <p className="text-xs text-muted-foreground">{client.business_name}</p>
          )}
        </div>

        <div className="text-xs space-y-1">
          <p className="text-muted-foreground">{client.email}</p>
          
          {client.website_url && (
            <a
              href={client.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {client.plan_type.replace(/_/g, " ")}
          </Badge>
          
          {client.monthly_fee_cents > 0 && (
            <span className="text-xs font-medium">
              {formatCurrency(client.monthly_fee_cents)}/mo
            </span>
          )}
        </div>

        {client.open_requests_count! > 0 && (
          <div className="text-xs text-muted-foreground">
            {client.open_requests_count} open request{client.open_requests_count !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPipeline;
