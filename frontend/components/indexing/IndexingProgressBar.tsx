import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

export function IndexingProgressBar({ progress = 45 }: { progress?: number }) {
  return (
    <div className="space-y-4 bg-card border border-border/40 p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <div>
            <h4 className="text-sm font-medium">Indexing Footage...</h4>
            <p className="text-xs text-muted-foreground">Processing 2023-10-15_14-30.mp4 (Chunk 12/45)</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium font-mono">{progress}%</span>
          <p className="text-xs text-muted-foreground">~4m left</p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs">
          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Job
        </Button>
      </div>
    </div>
  );
}
