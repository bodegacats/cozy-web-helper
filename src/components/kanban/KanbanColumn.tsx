import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntakeCard } from "./IntakeCard";

interface Intake {
  id: string;
  name: string;
  business_name: string | null;
  fit_status: "good" | "borderline" | "not_fit";
  suggested_tier: "500" | "1000" | "1500" | null;
  source?: string | null;
  discount_offered?: boolean | null;
  discount_amount?: number | null;
  created_at: string;
}

interface KanbanColumnProps {
  stage: { id: string; label: string };
  intakes: Intake[];
  onIntakeClick: (intake: any) => void;
}

export const KanbanColumn = ({ stage, intakes, onIntakeClick }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div ref={setNodeRef} className="flex flex-col">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {stage.label}
            <span className="text-xs text-muted-foreground">
              {intakes.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {intakes.map((intake) => (
            <IntakeCard
              key={intake.id}
              intake={intake}
              onClick={() => onIntakeClick(intake)}
            />
          ))}
          {intakes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No intakes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};