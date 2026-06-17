'use client';
// ===========================================
// src/components/files/FileUploader.tsx
// Drag-and-drop PDF uploader.
// Calls our /api/upload endpoint, then redirects to the file page.
// ===========================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    // Validate type
    if (selected.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are accepted.');
      return;
    }

    // Validate size (25 MB max)
    if (selected.size > 25 * 1024 * 1024) {
      setErrorMsg('File must be smaller than 25 MB.');
      return;
    }

    setFile(selected);
    setErrorMsg(null);
    setStatus('idle');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
  });

  async function handleUpload() {
    if (!file) return;

    setStatus('uploading');
    setProgress(10);
    setErrorMsg(null);

    try {
      // Build a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      setProgress(100);
      setStatus('success');

      // Go to the file detail page after a short delay
      setTimeout(() => {
        router.push(`/files/${data.file_id}`);
      }, 1200);

    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  function reset() {
    setFile(null);
    setStatus('idle');
    setErrorMsg(null);
    setProgress(0);
  }

  return (
    <div className="space-y-5">

      {/* Drop zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'glass-card p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-violet-500/60 bg-violet-500/5'
              : 'hover:border-white/20 hover:bg-white/5'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Upload className={cn('w-7 h-7', isDragActive ? 'text-violet-400' : 'text-slate-400')} />
          </div>
          <p className="font-semibold text-lg mb-1">
            {isDragActive ? 'Drop it here!' : 'Drag & drop your PDF'}
          </p>
          <p className="text-slate-400 text-sm mb-4">or click to browse your files</p>
          <p className="text-slate-600 text-xs">PDF only · Max 25 MB</p>
        </div>
      ) : (
        /* File selected — show preview card */
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-slate-400 text-sm mt-0.5">{formatBytes(file.size)}</p>
            </div>
            {status === 'idle' && (
              <button
                onClick={reset}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress bar — shown while uploading */}
          {status === 'uploading' && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Uploading and extracting text…
              </p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Upload complete! Redirecting to your file…
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Upload button */}
      {file && status === 'idle' && (
        <button
          onClick={handleUpload}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload &amp; Extract Text
        </button>
      )}

      {status === 'uploading' && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing…
        </button>
      )}
    </div>
  );
}
