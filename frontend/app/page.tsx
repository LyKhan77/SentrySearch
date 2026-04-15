'use client';

import { IndexStatsCard } from "@/components/indexing/IndexStatsCard";
import { VideoUploader } from "@/components/indexing/VideoUploader";
import { IndexingProgressBar } from "@/components/indexing/IndexingProgressBar";
import { SearchBar } from "@/components/search/SearchBar";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const isIndexing = true;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Welcome to SentrySearch</h2>
        <p className="text-muted-foreground">Manage your dashcam footage library and run natural language searches.</p>
      </div>

      <IndexStatsCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quick Search</h3>
          <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm flex flex-col justify-center h-full">
            <SearchBar onSearch={(query) => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Index Status</h3>
          {isIndexing ? (
            <IndexingProgressBar progress={68} />
          ) : (
            <VideoUploader />
          )}
        </div>
      </div>
    </div>
  );
}
