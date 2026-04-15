import { Badge } from "@/components/ui/badge";

export type StatusType = "indexing" | "completed" | "error" | "pending";

export function StatusBadge({ status }: { status: StatusType }) {
  switch (status) {
    case "indexing":
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse">Indexing...</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>;
    case "error":
      return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
  }
}
