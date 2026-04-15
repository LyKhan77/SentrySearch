'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your preferences, API keys, and indexing options.</p>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>Choose which model to use for vector embeddings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Use Local Model (Qwen3-VL)</Label>
              <p className="text-sm text-muted-foreground">Keep all processing and data on this device.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="api-key">Google Gemini API Key</Label>
            <Input id="api-key" type="password" placeholder="AIzaSy..." disabled />
            <p className="text-xs text-muted-foreground">Required only if local model is disabled.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>Indexing Preferences</CardTitle>
          <CardDescription>Configure how videos are processed and stored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="chunk-duration">Chunk Duration (seconds)</Label>
              <Input id="chunk-duration" type="number" defaultValue="15" />
              <p className="text-xs text-muted-foreground">Length of each indexed segment.</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="chunk-overlap">Overlap (seconds)</Label>
              <Input id="chunk-overlap" type="number" defaultValue="3" />
              <p className="text-xs text-muted-foreground">Overlap between consecutive chunks.</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="db-path">ChromaDB Location</Label>
            <div className="flex gap-2">
              <Input id="db-path" type="text" defaultValue="/Users/leekhan/project/sentrySearch/db" />
              <Button variant="secondary">Browse</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
