import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

interface IntakeCardProps {
  intake: {
    id: string;
    name: string;
    business_name: string | null;
    fit_status: "good" | "borderline" | "not_fit";
    suggested_tier: "500" | "1000" | "1500" | null;
    created_at: string;
  };
  onClick: () => void;
}

export const IntakeCard = ({ intake, onClick }: IntakeCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: intake.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const fitColors = {
    good: "bg-green-100 text-green-800 border-green-200",
    borderline: "bg-yellow-100 text-yellow-800 border-yellow-200",
    not_fit: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{intake.name}</p>
            {intake.business_name && (
              <p className="text-xs text-muted-foreground truncate">
                {intake.business_name}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className={`text-xs ${fitColors[intake.fit_status]}`}>
                {intake.fit_status === "good" && "✅"}
                {intake.fit_status === "borderline" && "⚠️"}
                {intake.fit_status === "not_fit" && "❌"}
                {" "}{intake.fit_status}
              </Badge>
              {intake.suggested_tier && (
                <Badge variant="secondary" className="text-xs">
                  ${intake.suggested_tier}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(intake.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};