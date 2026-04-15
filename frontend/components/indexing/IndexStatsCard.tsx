import { Card, CardContent } from "@/components/ui/card";
import { Database, Film, HardDrive, Clock } from "lucide-react";

export function IndexStatsCard() {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-border/50">
        <div className="flex flex-col items-center justify-center text-center px-4">
          <Film className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">1,248</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Indexed Videos</span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center px-4">
          <Database className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">15,420</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Total Chunks</span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center px-4">
          <HardDrive className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">2.4 GB</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Vector DB Size</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-4">
          <Clock className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">45h 12m</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Total Footage</span>
        </div>
      </CardContent>
    </Card>
  );
}
