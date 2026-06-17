// ===========================================
// src/app/(dashboard)/files/page.tsx
// Shows all PDFs the user has uploaded.
// Clicking a file goes to the detail page.
// ===========================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Files, Upload, ArrowRight, Trash2 } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileRecord } from '@/types';

export default async function FilesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allFiles: FileRecord[] = files || [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-slate-400 mt-1">
            {allFiles.length === 0
              ? 'No files yet.'
              : `${allFiles.length} file${allFiles.length !== 1 ? 's' : ''} uploaded`}
          </p>
        </div>
        <Link href="/upload" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Upload className="w-4 h-4" />
          Upload PDF
        </Link>
      </div>

      {/* Empty state */}
      {allFiles.length === 0 && (
        <div className="glass-card p-14 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Files className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No files yet</h2>
          <p className="text-slate-400 text-sm mb-6">Upload a PDF to get started.</p>
          <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload your first PDF
          </Link>
        </div>
      )}

      {/* Files grid */}
      {allFiles.length > 0 && (
        <div className="grid gap-3">
          {allFiles.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file }: { file: FileRecord }) {
  const statusConfig = {
    uploaded:   { label: 'Uploaded',   classes: 'bg-slate-500/20 text-slate-400' },
    processing: { label: 'Processing', classes: 'bg-amber-500/20 text-amber-400' },
    ready:      { label: 'Ready',      classes: 'bg-emerald-500/20 text-emerald-400' },
    error:      { label: 'Error',      classes: 'bg-red-500/20 text-red-400' },
  };
  const { label, classes } = statusConfig[file.status] ?? statusConfig.uploaded;

  return (
    <Link
      href={`/files/${file.id}`}
      className="glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-150 group"
    >
      {/* PDF badge */}
      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-red-400 text-xs font-bold">PDF</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-slate-500 text-xs">
            {file.size_bytes ? formatBytes(file.size_bytes) : '—'}
          </span>
          {file.page_count && (
            <span className="text-slate-500 text-xs">{file.page_count} pages</span>
          )}
          <span className="text-slate-500 text-xs">{formatDate(file.created_at)}</span>
        </div>
      </div>

      {/* Status */}
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${classes}`}>
        {label}
      </span>

      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
    </Link>
  );
}
