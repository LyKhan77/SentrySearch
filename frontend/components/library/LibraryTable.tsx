import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Play } from "lucide-react";

export interface LibraryItem {
  id: string;
  name: string;
  duration: string;
  size: string;
  status: "indexed" | "indexing" | "error" | "missing";
  path: string;
  videoUrl: string;
}

interface LibraryTableProps {
  items: LibraryItem[];
  onDelete?: (id: string, path: string) => void;
  onPlay?: (item: LibraryItem) => void;
}

export function LibraryTable({ items = [], onDelete, onPlay }: LibraryTableProps) {
  return (
    <div className="rounded-md border border-border/40 bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No videos indexed yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell className="text-muted-foreground">{file.duration}</TableCell>
                <TableCell className="text-muted-foreground">{file.size}</TableCell>
                <TableCell>
                  {file.status === "indexed" && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">Indexed</Badge>}
                  {file.status === "indexing" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 animate-pulse hover:bg-blue-500/10">Indexing...</Badge>}
                  {file.status === "error" && <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/10">Error</Badge>}
                  {file.status === "missing" && <Badge variant="outline" className="text-muted-foreground">Missing</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    onClick={() => onPlay?.(file)}
                    variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onDelete?.(file.id, file.path)}
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
