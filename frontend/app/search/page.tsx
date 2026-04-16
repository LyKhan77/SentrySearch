'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultsGrid } from "@/components/search/SearchResultsGrid";
import { DualVideoPlayer } from "@/components/video/DualVideoPlayer";
import { type Clip } from "@/components/video/ClipCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('results');
  const [query, setQuery] = useState('');
  const [threshold, setThreshold] = useState(0.4);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const { data: results, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', query, threshold],
    queryFn: () => endpoints.search(query, threshold),
    enabled: !!query,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    setActiveTab('results');
    setSelectedClip(null);
  };

  const handleSelectClip = (clip: Clip) => {
    setSelectedClip(clip);
    setActiveTab('player');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col items-center mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="results">Grid Results</TabsTrigger>
            <TabsTrigger value="filters">Filters & Settings</TabsTrigger>
            <TabsTrigger value="player" disabled={!selectedClip}>Clip Player</TabsTrigger>
          </TabsList>
          
          {results && (
            <div className="text-sm text-muted-foreground">Found {results.length} matches</div>
          )}
        </div>

        <TabsContent value="results" className="mt-0 outline-none">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Searching through vectors...</p>
            </div>
          ) : error ? (
            <div className="p-8 border border-destructive/20 rounded-lg bg-destructive/5 text-destructive text-center">
              Search failed. Ensure your Gemini API key is configured correctly in Settings.
            </div>
          ) : !query ? (
            <div className="p-20 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/20">
              <h3 className="text-xl font-medium text-muted-foreground">Ready to search</h3>
              <p className="text-muted-foreground/60 mt-1">Enter a query above to find specific events in your footage.</p>
            </div>
          ) : (
            <SearchResultsGrid results={results || []} onSelectClip={handleSelectClip} />
          )}
        </TabsContent>

        <TabsContent value="filters" className="mt-0 outline-none">
          <SearchFilters threshold={threshold} onThresholdChange={setThreshold} />
        </TabsContent>

        <TabsContent value="player" className="mt-0 outline-none">
          <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
            {selectedClip ? (
              <DualVideoPlayer 
                originalUrl={selectedClip.videoUrl} 
                clipUrl={selectedClip.videoUrl}
                startTime={selectedClip.startTime}
                endTime={selectedClip.endTime}
                videoTitle={selectedClip.title}
              />
            ) : (
              <div className="flex items-center justify-center p-20 text-muted-foreground">
                Select a clip from the results grid to play.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
