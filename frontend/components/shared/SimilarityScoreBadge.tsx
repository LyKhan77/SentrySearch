import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SimilarityScoreBadge({ score }: { score: number }) {
  // Score typically between 0 and 1
  const isHigh = score > 0.8;
  const isMed = score > 0.5 && score <= 0.8;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono text-xs",
        isHigh && "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
        isMed && "border-amber-500/50 text-amber-600 bg-amber-500/10",
        !isHigh && !isMed && "border-muted text-muted-foreground bg-muted/20"
      )}
    >
      {(score * 100).toFixed(1)}% Match
    </Badge>
  );
}
