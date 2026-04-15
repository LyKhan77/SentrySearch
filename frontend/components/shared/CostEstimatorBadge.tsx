import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

export function CostEstimatorBadge({ estimatedCost }: { estimatedCost: number }) {
  return (
    <Badge variant="secondary" className="font-mono text-xs text-muted-foreground bg-muted/50 border-border/50 gap-1.5 flex items-center">
      <Coins className="w-3 h-3" />
      ~${estimatedCost.toFixed(4)}
    </Badge>
  );
}
