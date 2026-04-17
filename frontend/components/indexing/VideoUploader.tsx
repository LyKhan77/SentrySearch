'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Folder, X, FileVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { endpoints } from '@/lib/api';

interface VideoUploaderProps {
  onUpload: (folderPath: string) => void;
  onFileUpload: (jobId: string) => void;
}

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov'];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

type UploadMode = 'choose' | 'path' | 'files';

export function VideoUploader({ onUpload, onFileUpload }: VideoUploaderProps) {
  const [folderPath, setFolderPath] = useState('');
  const [mode, setMode] = useState<UploadMode>('choose');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const valid = acceptedFiles.filter(
      (f) =>
        SUPPORTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)) &&
        f.size <= MAX_FILE_SIZE
    );
    if (valid.length === 0 && acceptedFiles.length > 0) {
      setError(`No valid files selected. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }
    setError(null);
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newFiles = valid.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
    setMode('files');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    maxSize: MAX_FILE_SIZE,
    noClick: false,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await endpoints.uploadAndIndex(selectedFiles, (percent) => {
        setUploadProgress(percent);
      });
      onFileUpload(result.job_id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handlePathSubmit = () => {
    if (!folderPath.trim()) return;
    onUpload(folderPath.trim());
  };

  const handleAddFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onDrop(files);
    }
    e.target.value = '';
  };

  if (mode === 'choose') {
    return (
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-card/30 hover:bg-card/50 transition-colors cursor-pointer"
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-1">Index New Footage</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Drag and drop video files here, or click to browse. Supported formats: {SUPPORTED_EXTENSIONS.join(', ')}
        </p>

        {isDragActive && (
          <p className="text-primary font-medium mb-4">Drop the files here...</p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setMode('files'); }}>
            <FileVideo className="w-4 h-4 mr-2" /> Select Files
          </Button>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setMode('path'); }}>
            <Folder className="w-4 h-4 mr-2" /> Enter Path
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'path') {
    return (
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-card/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Folder className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-1">Enter Folder Path</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Provide the absolute path to a folder containing dashcam videos on the server.
        </p>

        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="/path/to/TeslaCam/SavedClips"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePathSubmit()}
          />
          <Button disabled={!folderPath.trim()} onClick={handlePathSubmit}>
            Start Indexing
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => { setMode('choose'); setFolderPath(''); }}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-card/30">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <FileVideo className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-1">
        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select Video Files'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {SUPPORTED_EXTENSIONS.join(', ')} files up to 2GB each
      </p>

      {error && (
        <div className="text-destructive text-sm mb-3 p-2 bg-destructive/10 rounded-md w-full max-w-sm">
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="w-full max-w-sm mb-4 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
              <span className="truncate flex-1 text-left">{file.name}</span>
              <span className="text-muted-foreground ml-2 text-xs whitespace-nowrap">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
              {!uploading && (
                <button onClick={() => removeFile(idx)} className="ml-2 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="w-full max-w-sm mb-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={SUPPORTED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex gap-3">
        <Button
          variant="secondary"
          disabled={uploading}
          onClick={handleAddFilesClick}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileVideo className="w-4 h-4 mr-2" />}
          Add Files
        </Button>
        <Button
          disabled={selectedFiles.length === 0 || uploading}
          onClick={handleFileUpload}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading...' : 'Start Indexing'}
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setMode('choose'); setSelectedFiles([]); setError(null); }}>
        Back
      </Button>
    </div>
  );
}