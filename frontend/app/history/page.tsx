'use client';

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { endpoints } from "@/lib/api";
import { Loader2, Search, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const router = useRouter();
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: () => endpoints.history(),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Search History</h1>
        <p className="text-muted-foreground">Your recent queries and AI matched highlights.</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading search history...</p>
          </div>
        ) : error ? (
          <div className="p-8 border border-destructive/20 rounded-lg bg-destructive/5 text-destructive text-center">
            Failed to load history.
          </div>
        ) : !history || history.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/20">
            <h3 className="text-xl font-medium text-muted-foreground">No history yet</h3>
            <p className="text-muted-foreground/60 mt-1">Your recent searches will appear here.</p>
          </div>
        ) : (
          history.map((item: any) => (
            <Card 
              key={item.id} 
              className="overflow-hidden border-border/40 hover:border-border/80 transition-all cursor-pointer group"
              onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1">"{item.query}"</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {item.results_count} matches
                      </span>
                      {item.top_result !== "N/A" && (
                         <>
                          <span>•</span>
                          <Badge variant="secondary" className="font-normal h-5 py-0">
                            {item.top_result}
                          </Badge>
                         </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-end mr-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">Match</span>
                      <span className="text-sm font-mono font-bold text-primary">{((item.best_score ?? 0) * 100).toFixed(0)}%</span>
                    </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
