'use client';

import { useState } from 'react';
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultsGrid } from "@/components/search/SearchResultsGrid";
import { DualVideoPlayer } from "@/components/video/DualVideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockResults = [
  { id: '1', title: 'Red truck cutting off in intersection', thumbnailUrl: 'https://images.unsplash.com/photo-1555519827-0db769b76e82?q=80&w=600&auto=format&fit=crop', score: 0.89, duration: '0:15', timestamp: '2023-10-15 14:32:10' },
  { id: '2', title: 'Red truck speeding past on highway', thumbnailUrl: 'https://images.unsplash.com/photo-1553535948-26154fbd9b3b?q=80&w=600&auto=format&fit=crop', score: 0.76, duration: '0:12', timestamp: '2023-10-12 09:15:22' },
  { id: '3', title: 'Close call with red SUV', thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600&auto=format&fit=crop', score: 0.65, duration: '0:20', timestamp: '2023-09-28 17:45:00' },
];

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('results');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col items-center mb-8">
        <SearchBar onSearch={(q) => console.log('Searching for:', q)} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="results">Grid Results</TabsTrigger>
            <TabsTrigger value="filters">Filters & Settings</TabsTrigger>
            <TabsTrigger value="player">Clip Player</TabsTrigger>
          </TabsList>
          
          {activeTab === 'results' && (
            <div className="text-sm text-muted-foreground">Found 3 matches</div>
          )}
        </div>

        <TabsContent value="results" className="mt-0 outline-none">
          <SearchResultsGrid results={mockResults} />
        </TabsContent>

        <TabsContent value="filters" className="mt-0 outline-none">
          <SearchFilters />
        </TabsContent>

        <TabsContent value="player" className="mt-0 outline-none">
          <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
            <DualVideoPlayer 
              originalUrl="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
              clipUrl="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
