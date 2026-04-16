'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";
import { endpoints } from "@/lib/api";

interface DualVideoPlayerProps {
  originalUrl: string;
  clipUrl: string;
  startTime?: number;
  endTime?: number;
  videoTitle?: string;
}

export function DualVideoPlayer({ originalUrl, clipUrl, startTime, endTime, videoTitle }: DualVideoPlayerProps) {
  const clipVideoRef = useRef<HTMLVideoElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (clipVideoRef.current && startTime !== undefined) {
      clipVideoRef.current.currentTime = 0;
      clipVideoRef.current.play().catch(() => {});
    }
  }, [clipUrl, startTime]);

  const handleTimeUpdate = () => {
    if (clipVideoRef.current && endTime !== undefined && startTime !== undefined) {
      const paddedEnd = endTime - startTime + 2.0;
      if (clipVideoRef.current.currentTime >= paddedEnd) {
        clipVideoRef.current.pause();
      }
    }
  };

  const title = videoTitle || clipUrl.split('/').pop() || 'video';
  const trimmedClipUrl = (startTime !== undefined && endTime !== undefined)
    ? endpoints.trimClip(title, startTime, endTime)
    : clipUrl;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">Original Footage</h3>
          <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">FULL EVENT</Badge>
        </div>
        <Card className="overflow-hidden bg-black aspect-video rounded-xl border-border/50 shadow-sm flex items-center justify-center relative group">
          <video 
            ref={originalVideoRef}
            className="w-full h-full object-cover" 
            controls 
            src={originalUrl} 
            key={`original-${originalUrl}`}
          >
            Your browser does not support the video tag.
          </video>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">Matched Clip</h3>
          <Badge variant="default" className="text-[10px] font-medium tracking-wide bg-primary/90">AI MATCHED</Badge>
        </div>
        <Card className="overflow-hidden bg-black aspect-video rounded-xl border-border/50 shadow-sm flex items-center justify-center relative group">
          <video 
            ref={clipVideoRef}
            className="w-full h-full object-cover" 
            controls 
            src={trimmedClipUrl}
            key={`clip-${trimmedClipUrl}`}
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support the video tag.
          </video>
        </Card>
      </div>
    </div>
  );
}