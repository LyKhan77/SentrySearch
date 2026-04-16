import { 
  Progress, 
  ProgressTrack, 
  ProgressIndicator 
} from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndexingProgressBarProps {
  progress: number;
  status: string;
  eta: string;
  done: boolean;
  cancelled: boolean;
  fallback_occurred?: boolean;
  fallback_reason?: string | null;
  onCancel?: () => void;
}

export function IndexingProgressBar({ 
  progress, 
  status, 
  eta, 
  done, 
  cancelled, 
  fallback_occurred = false,
  fallback_reason = null,
  onCancel 
}: IndexingProgressBarProps) {
  const isError = status.toLowerCase().includes('error') || status.toLowerCase().includes('failed');
  
  return (
    <div className={cn(
      "space-y-4 bg-card border p-5 rounded-xl shadow-sm",
      isError ? "border-destructive/40" : "border-border/40"
    )}>
      {/* Fallback Warning */}
      {fallback_occurred && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Using Gemini Fallback
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              {fallback_reason || "Local model failed. Switched to Gemini embedding to continue indexing."}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : cancelled ? (
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          ) : done ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          <div>
            <h4 className="text-sm font-medium">
              {isError ? "Indexing Failed" : cancelled ? "Indexing Cancelled" : done ? "Indexing Complete" : "Indexing Footage..."}
            </h4>
            <p className={cn(
              "text-xs",
              isError ? "text-destructive" : "text-muted-foreground"
            )}>{status}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium font-mono">{progress}%</span>
          <p className="text-xs text-muted-foreground">{eta}</p>
        </div>
        </div>

        <Progress value={progress} className="h-2">
        <ProgressTrack>
          <ProgressIndicator
            className={cn(
              isError ? "bg-destructive" : done ? "bg-emerald-500" : "bg-primary"
            )}
          />        </ProgressTrack>
      </Progress>
      
      {!done && !cancelled && !isError && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
            onClick={onCancel}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Job
          </Button>
        </div>
      )}
    </div>
  );
}
