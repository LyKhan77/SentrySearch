'use client';

import { useState } from "react";
import { LibraryTable, type LibraryItem } from "@/components/library/LibraryTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints, fetchApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const [playingItem, setPlayingItem] = useState<LibraryItem | null>(null);
  
  const { data: libraryItems, isLoading, error } = useQuery({
    queryKey: ['library'],
    queryFn: endpoints.library,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, path }: { id: string, path: string }) => 
      fetchApi(`/library/${id}?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success("Item removed from index");
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`);
    }
  });

  const handleDelete = (id: string, path: string) => {
    if (confirm("Are you sure you want to remove this video from the index? This will NOT delete the actual file.")) {
      deleteMutation.mutate({ id, path });
    }
  };

  const handlePlay = (item: LibraryItem) => {
    setPlayingItem(item);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Footage Library</h2>
          <p className="text-muted-foreground">Manage and review all your indexed dashcam videos.</p>
        </div>
        <Link href="/">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Footage
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading library...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/20 rounded-lg bg-destructive/5 text-destructive text-center">
          Failed to load library items. Please check if the backend is running.
        </div>
      ) : (
        <LibraryTable 
          items={libraryItems || []} 
          onDelete={handleDelete}
          onPlay={handlePlay}
        />
      )}

      <Dialog open={!!playingItem} onOpenChange={(open) => !open && setPlayingItem(null)}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black/95 border-border/40">
          <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <DialogTitle className="text-white drop-shadow-md">
              {playingItem?.name}
            </DialogTitle>
          </DialogHeader>
          {playingItem && (
            <div className="w-full aspect-video bg-black flex items-center justify-center relative pt-14 pb-2">
              <video 
                src={playingItem.videoUrl} 
                controls 
                autoPlay 
                className="max-w-full max-h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
