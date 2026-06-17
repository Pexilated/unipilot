// ===========================================
// src/app/(dashboard)/files/[id]/page.tsx
// The main study page for a single uploaded PDF.
// Has three tabs: Summary · Quiz · Chat
// ===========================================

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatBytes } from '@/lib/utils';
import FileStudyTabs from '@/components/files/FileStudyTabs';
import { FileText } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch the file — RLS ensures only the owner can see it
  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !file) notFound();

  // Fetch existing summary (if already generated)
  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('file_id', id)
    .single();

  // Fetch existing quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('file_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch chat history
  const { data: chatMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('file_id', id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">

      {/* File header */}
      <div className="glass-card p-5 flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-red-400 text-xs font-bold">PDF</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl truncate">{file.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {file.size_bytes && (
              <span className="text-slate-400 text-sm">{formatBytes(file.size_bytes)}</span>
            )}
            {file.page_count && (
              <span className="text-slate-400 text-sm">{file.page_count} pages</span>
            )}
            <span className="text-slate-400 text-sm">Uploaded {formatDate(file.created_at)}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              file.status === 'ready'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {file.status === 'ready' ? 'Ready' : 'Processing'}
            </span>
          </div>
        </div>
      </div>

      {/* No text extracted warning */}
      {!file.extracted_text && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl px-5 py-4 flex items-start gap-3">
          <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">No text could be extracted</p>
            <p className="text-sm mt-0.5 text-amber-400/70">
              This PDF may be a scanned image. AI features require text-based PDFs.
            </p>
          </div>
        </div>
      )}

      {/* Study tabs — client component */}
      <FileStudyTabs
        file={file}
        initialSummary={summary}
        initialQuiz={quiz}
        initialMessages={chatMessages || []}
      />
    </div>
  );
}
