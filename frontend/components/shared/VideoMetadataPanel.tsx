import { Calendar, Clock, Monitor, HardDrive } from "lucide-react";

interface MetadataProps {
  duration: string;
  resolution: string;
  date: string;
  size: string;
}

export function VideoMetadataPanel({ duration, resolution, date, size }: MetadataProps) {
  return (
    <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> {duration}
      </div>
      <div className="flex items-center gap-1.5">
        <Monitor className="w-3.5 h-3.5" /> {resolution}
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" /> {date}
      </div>
      <div className="flex items-center gap-1.5">
        <HardDrive className="w-3.5 h-3.5" /> {size}
      </div>
    </div>
  );
}
