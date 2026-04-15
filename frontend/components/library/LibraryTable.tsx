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

const mockLibrary = [
  { id: 1, name: "2023-10-15_14-30.mp4", duration: "12:05", size: "345 MB", status: "indexed" },
  { id: 2, name: "2023-10-15_15-10.mp4", duration: "05:22", size: "120 MB", status: "indexed" },
  { id: 3, name: "2023-10-16_08-45.mp4", duration: "24:10", size: "670 MB", status: "indexing" },
  { id: 4, name: "2023-10-16_18-05.mp4", duration: "15:30", size: "410 MB", status: "error" },
];

export function LibraryTable() {
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
          {mockLibrary.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell className="text-muted-foreground">{file.duration}</TableCell>
              <TableCell className="text-muted-foreground">{file.size}</TableCell>
              <TableCell>
                {file.status === "indexed" && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">Indexed</Badge>}
                {file.status === "indexing" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 animate-pulse hover:bg-blue-500/10">Indexing...</Badge>}
                {file.status === "error" && <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/10">Error</Badge>}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
