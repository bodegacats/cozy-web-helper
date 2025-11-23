import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ClientCard } from "./ClientCard";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  pipeline_stage: string;
  open_requests_count?: number;
}

interface ClientKanbanColumnProps {
  stage: { id: string; label: string };
  clients: Client[];
  onClientClick: (clientId: string) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  setDraggedClient: (client: Client | null) => void;
}

export const ClientKanbanColumn = ({ 
  stage, 
  clients, 
  onClientClick, 
  onDrop, 
  setDraggedClient 
}: ClientKanbanColumnProps) => {
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
            onClientClick={onClientClick}
            setDraggedClient={setDraggedClient}
          />
        ))}
      </div>
    </div>
  );
};

interface DraggableClientCardProps {
  client: Client;
  onClientClick: (clientId: string) => void;
  setDraggedClient: (client: Client | null) => void;
}

const DraggableClientCard = ({ client, onClientClick, setDraggedClient }: DraggableClientCardProps) => {
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
      <ClientCard client={client} onClick={() => onClientClick(client.id)} />
    </div>
  );
};
