'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    model: 'gemini',
    chunk_duration: 5,
    overlap: 2,
    gemini_api_key: ''
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: endpoints.settings,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        model: settings.model || 'gemini',
        chunk_duration: settings.chunk_duration || 5,
        overlap: settings.overlap || 2,
        gemini_api_key: settings.gemini_api_key || ''
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: endpoints.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your preferences, API keys, and indexing options.</p>
        </div>
        {updateMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
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
              {settings?.active_backend && (
                <p className="text-xs text-primary font-medium">
                  Currently active: {settings.active_backend === 'local' ? `Local ${settings.active_model || 'Qwen3-VL'}` : 'Gemini'}
                </p>
              )}
            </div>
            <Switch 
              checked={formData.model === 'local'} 
              onCheckedChange={(checked) => setFormData({...formData, model: checked ? 'local' : 'gemini'})}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="api-key">Google Gemini API Key</Label>
            <Input 
              id="api-key" 
              type="password" 
              placeholder="AIzaSy..." 
              value={formData.gemini_api_key}
              onChange={(e) => setFormData({...formData, gemini_api_key: e.target.value})}
              disabled={formData.model === 'local'} 
            />
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
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="chunk-duration">Chunk Duration (seconds)</Label>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Durasi setiap segmen video dalam detik saat proses indexing. Semakin kecil durasinya, semakin detail pencarian, namun proses indexing akan lebih lama dan memori yang digunakan lebih besar.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="chunk-duration" 
                  type="number" 
                  value={formData.chunk_duration}
                  onChange={(e) => setFormData({...formData, chunk_duration: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">Length of each indexed segment.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="chunk-overlap">Overlap (seconds)</Label>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Durasi tumpang tindih (overlap) antara potongan video yang berurutan. Berfungsi untuk menjaga agar tidak ada konteks/kejadian yang terpotong pada batas transisi antar chunk.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="chunk-overlap" 
                  type="number" 
                  value={formData.overlap}
                  onChange={(e) => setFormData({...formData, overlap: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">Overlap between consecutive chunks.</p>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setFormData({
          model: settings?.model || 'gemini',
          chunk_duration: settings?.chunk_duration || 5,
          overlap: settings?.overlap || 2,
          gemini_api_key: settings?.gemini_api_key || ''
        })}>Discard Changes</Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
