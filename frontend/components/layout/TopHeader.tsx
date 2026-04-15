import { Badge } from "@/components/ui/badge";

export function TopHeader() {
  return (
    <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium">Search Footage</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-normal text-xs text-muted-foreground">Local Qwen3-VL</Badge>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
    </header>
  );
}
