import { Card, CardContent } from "@/components/ui/card";
import { Clock, Search } from "lucide-react";

export default function HistoryPage() {
  const mockHistory = [
    { id: 1, query: "Red truck cutting me off", time: "2 hours ago", results: 3 },
    { id: 2, query: "Deer crossing road at night", time: "Yesterday", results: 1 },
    { id: 3, query: "Motorcycle weaving through traffic", time: "Oct 12, 2023", results: 8 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Search History</h2>
        <p className="text-muted-foreground">Recent queries and generated clips.</p>
      </div>

      <div className="space-y-4">
        {mockHistory.map((item) => (
          <Card key={item.id} className="border-border/40 shadow-sm hover:border-border/80 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="font-medium">{item.query}</h4>
                  <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                    <span>•</span>
                    <span>{item.results} matches</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
