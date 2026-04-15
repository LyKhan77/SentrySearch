import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import { SimilarityScoreBadge } from "@/components/shared/SimilarityScoreBadge";
import { ThumbnailImage } from "@/components/shared/ThumbnailImage";

export interface Clip {
  id: string;
  title: string;
  thumbnailUrl: string;
  score: number;
  duration: string;
  timestamp: string;
}

export function ClipCard({ clip }: { clip: Clip }) {
  return (
    <Card className="overflow-hidden group flex flex-col border-border/40 hover:border-border/80 transition-colors shadow-sm hover:shadow-md">
      <div className="aspect-video relative">
        <ThumbnailImage src={clip.thumbnailUrl} alt={clip.title} />
        <div className="absolute top-2 right-2 z-20">
          <SimilarityScoreBadge score={clip.score} />
        </div>
        <div className="absolute bottom-2 right-2 z-20 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-white/90">
          {clip.duration}
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{clip.title}</h4>
        <p className="text-xs text-muted-foreground">{clip.timestamp}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="secondary" size="sm" className="w-full text-xs h-8">
          <Info className="w-3 h-3 mr-1.5" /> Details
        </Button>
        <Button variant="default" size="sm" className="w-full text-xs h-8">
          <Download className="w-3 h-3 mr-1.5" /> Save Clip
        </Button>
      </CardFooter>
    </Card>
  );
}
