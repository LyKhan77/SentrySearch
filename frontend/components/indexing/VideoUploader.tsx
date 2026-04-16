'use client';

import { useState } from 'react';
import { UploadCloud, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoUploaderProps {
  onUpload: (folderPath: string) => void;
}

export function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [folderPath, setFolderPath] = useState('');

  return (
    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-card/30 hover:bg-card/50 transition-colors">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <UploadCloud className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-1">Index New Footage</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Select a folder containing your dashcam videos. SentrySearch will extract chunks, generate embeddings, and store them locally.
      </p>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input 
          type="text" 
          placeholder="/path/to/TeslaCam/SavedClips" 
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
        />
        <Button variant="secondary" onClick={() => alert("Browser folder selection is not supported in web browsers for security reasons. Please paste the absolute path.")}>
          <Folder className="w-4 h-4 mr-2" /> Browse
        </Button>
      </div>
      
      <Button 
        className="mt-6 w-full max-w-sm" 
        disabled={!folderPath}
        onClick={() => onUpload(folderPath)}
      >
        Start Indexing
      </Button>
    </div>
  );
}
