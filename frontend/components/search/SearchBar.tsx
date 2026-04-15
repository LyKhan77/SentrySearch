'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    onSearch(query);
    // Simulate search delay for UI
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto shadow-sm rounded-xl border border-border/40 bg-card focus-within:ring-1 focus-within:ring-ring transition-all">
      <Textarea 
        placeholder="Describe what you are looking for... (e.g., 'a red truck cutting me off')"
        className="min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 p-4 bg-transparent text-base placeholder:text-muted-foreground/60"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
          }
        }}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2 hidden sm:inline-block">Press Enter to search</span>
        <Button size="sm" onClick={handleSearch} disabled={isSearching || !query.trim()} className="rounded-lg px-4">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </div>
    </div>
  );
}
