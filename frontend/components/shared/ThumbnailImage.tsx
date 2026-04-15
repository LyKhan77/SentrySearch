import Image from "next/image";
import { Play } from "lucide-react";

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  showPlayIcon?: boolean;
}

export function ThumbnailImage({ src, alt, className = "", showPlayIcon = true }: ThumbnailImageProps) {
  return (
    <div className={`relative overflow-hidden bg-muted group ${className}`}>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 absolute inset-0"
      />
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90 group-hover:scale-110 group-hover:bg-primary/90 transition-all">
            <Play className="w-4 h-4 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
