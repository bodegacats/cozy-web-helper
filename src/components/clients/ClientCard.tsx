import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  pipeline_stage: string;
  open_requests_count?: number;
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export const ClientCard = ({ client, onClick }: ClientCardProps) => {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
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

        {client.open_requests_count! > 0 && (
          <div className="text-xs text-muted-foreground">
            {client.open_requests_count} open request{client.open_requests_count !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
