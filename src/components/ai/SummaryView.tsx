'use client';
// ===========================================
// src/components/ai/SummaryView.tsx
// Shows the AI summary for a file.
// If no summary exists, shows a "Generate" button.
// ===========================================

import { useState } from 'react';
import { Brain, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import type { FileRecord, Summary } from '@/types';

interface SummaryViewProps {
  file: FileRecord;
  initialSummary: Summary | null;
}

export default function SummaryView({ file, initialSummary }: SummaryViewProps) {
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: file.id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate summary');

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // No text extracted — can't summarise
  if (!file.extracted_text) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Summary requires text-based PDFs.</p>
      </div>
    );
  }

  // No summary yet — show generate button
  if (!summary && !loading) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Generate a summary</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
          UniPilot will read your document and write a clear summary with key points.
        </p>
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        <button onClick={generateSummary} className="btn-primary inline-flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Generate Summary
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="glass-card p-10 text-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
        <p className="font-medium mb-1">Reading your document…</p>
        <p className="text-slate-400 text-sm">This usually takes 10–20 seconds.</p>
      </div>
    );
  }

  // Summary exists — display it
  return (
    <div className="space-y-5">

      {/* Key points */}
      {summary!.key_points && summary!.key_points.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Key Points
          </h3>
          <ul className="space-y-2.5">
            {summary!.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-violet-400 text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full summary */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          Full Summary
        </h3>
        <div className="text-slate-300 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
          {summary!.content}
        </div>
      </div>

      {/* Regenerate button */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Regenerate summary
      </button>
    </div>
  );
}
