// ===========================================
// src/app/(dashboard)/dashboard/page.tsx
// The home page after login.
// Shows stats summary and recently uploaded files.
// This is a Server Component — data is fetched on the server.
// ===========================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Upload, Files, Brain, ArrowRight, BookOpen } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileRecord } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch all files for stats
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch summary count
  const { count: summaryCount } = await supabase
    .from('summaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const allFiles: FileRecord[] = files || [];
  const recentFiles = allFiles.slice(0, 4);
  const readyFiles = allFiles.filter((f) => f.status === 'ready').length;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const stats = [
    {
      label: 'Files Uploaded',
      value: allFiles.length,
      icon: Files,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Ready to Study',
      value: readyFiles,
      icon: BookOpen,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Summaries Created',
      value: summaryCount || 0,
      icon: Brain,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Good to see you, {firstName} 👋</h1>
        <p className="text-slate-400 mt-1">
          {allFiles.length === 0
            ? 'Upload your first PDF to get started.'
            : `You have ${allFiles.length} file${allFiles.length !== 1 ? 's' : ''} uploaded.`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      {allFiles.length === 0 ? (
        /* Empty state — first-time user */
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Upload className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Upload your first PDF</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Drop in a lecture file and UniPilot will summarise it, generate quiz questions, and let you chat with it.
          </p>
          <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload a PDF
          </Link>
        </div>
      ) : (
        /* Recent files list */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent files</h2>
            <Link
              href="/files"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentFiles.map((file) => (
              <Link
                key={file.id}
                href={`/files/${file.id}`}
                className="glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-colors group"
              >
                {/* PDF icon */}
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-xs font-bold">PDF</span>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {file.size_bytes ? formatBytes(file.size_bytes) : '—'} · {formatDate(file.created_at)}
                  </p>
                </div>

                {/* Status badge */}
                <StatusBadge status={file.status} />

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Upload more */}
          <Link
            href="/upload"
            className="mt-4 w-full glass-card p-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-dashed"
          >
            <Upload className="w-4 h-4" />
            Upload another PDF
          </Link>
        </div>
      )}
    </div>
  );
}

// Small inline component for the status pill
function StatusBadge({ status }: { status: FileRecord['status'] }) {
  const map = {
    uploaded:   { label: 'Uploaded',   classes: 'bg-slate-500/20 text-slate-400' },
    processing: { label: 'Processing', classes: 'bg-amber-500/20 text-amber-400' },
    ready:      { label: 'Ready',      classes: 'bg-emerald-500/20 text-emerald-400' },
    error:      { label: 'Error',      classes: 'bg-red-500/20 text-red-400' },
  };
  const { label, classes } = map[status] ?? map.uploaded;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${classes}`}>
      {label}
    </span>
  );
}
