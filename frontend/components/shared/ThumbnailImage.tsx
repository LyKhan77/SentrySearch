'use client';

import { Play, Video } from "lucide-react";
import { useState } from "react";

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  showPlayIcon?: boolean;
}

export function ThumbnailImage({ src, alt, className = "", showPlayIcon = true }: ThumbnailImageProps) {
  const [error, setError] = useState(false);
  const isPlaceholder = src.includes('placeholder-clip.jpg');

  return (
    <div className={`relative overflow-hidden bg-muted group w-full h-full min-h-[140px] flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
      
      {!error && !isPlaceholder ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 absolute inset-0"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
          <Video className="w-10 h-10" />
          <span className="text-[10px] font-mono uppercase tracking-wider">No Thumbnail</span>
        </div>
      )}

      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90 group-hover:scale-110 group-hover:bg-primary/90 transition-all">
            <Play className="w-4 h-4 ml-1 fill-current" />
          </div>
        </div>
      )}
    </div>
  );
}
