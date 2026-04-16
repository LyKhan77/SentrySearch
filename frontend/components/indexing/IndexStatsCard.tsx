'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Database, Film, HardDrive, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";

export function IndexStatsCard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: endpoints.stats,
    refetchInterval: 5000, // Refetch every 5 seconds for live-ish updates
  });

  if (isLoading) {
    return (
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-6 flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/40 shadow-sm border-destructive/50">
        <CardContent className="p-6 flex items-center justify-center h-24 text-destructive text-sm">
          Failed to load statistics
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-border/50">
        <div className="flex flex-col items-center justify-center text-center px-4">
          <Film className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">{stats.total_videos}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Indexed Videos</span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center px-4">
          <Database className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">{stats.total_chunks}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Total Chunks</span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center px-4">
          <HardDrive className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">{stats.vector_db_size}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Vector DB Size</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-4">
          <Clock className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-2xl font-semibold tracking-tight">{stats.total_footage_duration}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Total Footage</span>
        </div>
      </CardContent>
    </Card>
  );
}
