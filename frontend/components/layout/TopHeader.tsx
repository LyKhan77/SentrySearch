'use client';

import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";

export function TopHeader() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: endpoints.settings,
  });

  const backendLabel = settings?.active_backend === 'local'
    ? `Local ${settings.active_model || 'Qwen3-VL'}`
    : 'Gemini';

  return (
    <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium">Search Footage</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-normal text-xs text-muted-foreground">{backendLabel}</Badge>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
    </header>
  );
}