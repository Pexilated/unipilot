// ===========================================
// src/app/(dashboard)/upload/page.tsx
// Upload page — simple wrapper around the FileUploader component.
// ===========================================

import FileUploader from '@/components/files/FileUploader';
import { Upload } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Upload className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold">Upload a PDF</h1>
        </div>
        <p className="text-slate-400">
          We'll extract the text, then you can generate a summary, quiz questions, or chat with it.
        </p>
      </div>

      {/* Uploader component */}
      <FileUploader />

      {/* Tips */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-sm font-medium text-slate-300">Tips for best results</p>
        <ul className="space-y-2">
          {[
            'Use text-based PDFs, not scanned images',
            'Lecture slides and textbook chapters work great',
            'Larger files take a few extra seconds to process',
            'Max file size is 25 MB',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-violet-400 mt-0.5">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
