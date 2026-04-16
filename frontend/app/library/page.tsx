'use client';

import { LibraryTable, type LibraryItem } from "@/components/library/LibraryTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints, fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
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
    // Navigate to search page with this video selected? 
    // Or just open it. For now, let's redirect to search with a query that might find it
    // or we could add a direct 'player' route. 
    // Let's assume we want to "Search inside this video"
    router.push(`/search?video=${encodeURIComponent(item.path)}`);
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
    </div>
  );
}
