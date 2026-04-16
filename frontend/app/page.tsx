'use client';

import { useState, useEffect } from 'react';
import { IndexStatsCard } from "@/components/indexing/IndexStatsCard";
import { VideoUploader } from "@/components/indexing/VideoUploader";
import { IndexingProgressBar } from "@/components/indexing/IndexingProgressBar";
import { SearchBar } from "@/components/search/SearchBar";
import { useRouter } from "next/navigation";
import { endpoints } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [indexingState, setIndexingState] = useState({
    progress: 0,
    status: 'Initializing...',
    eta: 'calculating...',
    done: false,
    cancelled: false
  });

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(endpoints.progressStream(jobId));

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setIndexingState({
        progress: data.progress,
        status: data.status,
        eta: data.eta,
        done: data.done,
        cancelled: data.cancelled
      });

      if (data.done || data.cancelled) {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIndexingState(prev => ({
        ...prev,
        status: 'Connection lost. Check backend.',
      }));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  const handleStartIndexing = async (folderPath: string) => {
    try {
      const response = await endpoints.startIndexing(folderPath);
      setJobId(response.job_id);
    } catch (err) {
      console.error('Failed to start indexing:', err);
      alert('Failed to start indexing. Check console for details.');
    }
  };

  const handleCancelIndexing = async () => {
    if (!jobId) return;
    try {
      await endpoints.cancelIndexing(jobId);
    } catch (err) {
      console.error('Failed to cancel indexing:', err);
    }
  };

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
          {jobId ? (
            <IndexingProgressBar 
              progress={indexingState.progress} 
              status={indexingState.status}
              eta={indexingState.eta}
              done={indexingState.done}
              cancelled={indexingState.cancelled}
              onCancel={handleCancelIndexing}
            />
          ) : (
            <VideoUploader onUpload={handleStartIndexing} />
          )}
        </div>
      </div>
    </div>
  );
}
