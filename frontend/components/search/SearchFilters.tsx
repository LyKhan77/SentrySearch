'use client';

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface SearchFiltersProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export function SearchFilters({ threshold, onThresholdChange }: SearchFiltersProps) {
  // Use local state for immediate UI feedback while sliding
  const [localThreshold, setLocalThreshold] = useState(threshold);

  // Sync with prop if it changes from outside
  useEffect(() => {
    setLocalThreshold(threshold);
  }, [threshold]);

  // Debounce the update to the parent component
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localThreshold !== threshold && localThreshold !== undefined) {
        onThresholdChange(localThreshold);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localThreshold, threshold, onThresholdChange]);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-5 flex flex-col sm:flex-row gap-8">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Similarity Threshold</Label>
            <span className="text-xs text-muted-foreground font-mono">{(localThreshold ?? 0).toFixed(2)}</span>
          </div>
          <Slider 
            value={[localThreshold ?? 0]} 
            onValueChange={(vals) => {
              const newValue = Array.isArray(vals) ? vals[0] : (typeof vals === 'number' ? vals : 0);
              setLocalThreshold(newValue);
            }}
            max={1} 
            step={0.01} 
          />
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
