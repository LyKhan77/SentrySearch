'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DualVideoPlayerProps {
  originalUrl: string;
  clipUrl: string;
}

export function DualVideoPlayer({ originalUrl, clipUrl }: DualVideoPlayerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">Original Footage</h3>
          <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">FULL EVENT</Badge>
        </div>
        <Card className="overflow-hidden bg-black aspect-video rounded-xl border-border/50 shadow-sm flex items-center justify-center relative group">
          {/* Mock video player for now */}
          <video className="w-full h-full object-cover" controls src={originalUrl} poster="/placeholder-original.jpg">
            Your browser does not support the video tag.
          </video>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">Matched Clip</h3>
          <Badge variant="default" className="text-[10px] font-medium tracking-wide bg-primary/90">AI TRIMMED</Badge>
        </div>
        <Card className="overflow-hidden bg-black aspect-video rounded-xl border-border/50 shadow-sm flex items-center justify-center relative group">
           {/* Mock video player for now */}
           <video className="w-full h-full object-cover" controls src={clipUrl} poster="/placeholder-clip.jpg">
            Your browser does not support the video tag.
          </video>
        </Card>
      </div>
    </div>
  );
}
