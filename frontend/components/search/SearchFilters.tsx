'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export function SearchFilters() {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-5 flex flex-col sm:flex-row gap-8">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Similarity Threshold</Label>
            <span className="text-xs text-muted-foreground font-mono">0.65</span>
          </div>
          <Slider defaultValue={[0.65]} max={1} step={0.05} />
          <p className="text-[10px] text-muted-foreground">Higher values return fewer, more precise matches.</p>
        </div>

        <div className="flex-1 space-y-4 pt-1 sm:pt-0">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Local Processing (Qwen3-VL)</Label>
              <p className="text-[10px] text-muted-foreground">Keep all data on this device.</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Tesla Overlay Metadata</Label>
              <p className="text-[10px] text-muted-foreground">Extract speed & steering data.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
