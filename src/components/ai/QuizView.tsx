'use client';
// ===========================================
// src/components/ai/QuizView.tsx
// Generates and displays a multiple-choice quiz.
// Tracks answers and shows score at the end.
// ===========================================

import { useState } from 'react';
import { Zap, Loader2, RefreshCw, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileRecord, Quiz, QuizQuestion } from '@/types';

interface QuizViewProps {
  file: FileRecord;
  initialQuiz: Quiz | null;
}

export default function QuizView({ file, initialQuiz }: QuizViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(initialQuiz);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which answer the user selected for each question (null = not answered)
  const [selected, setSelected] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  async function generateQuiz() {
    setLoading(true);
    setError(null);
    setSelected([]);
    setSubmitted(false);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: file.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');

      setQuiz(data.quiz);
      setSelected(new Array(data.quiz.questions.length).fill(null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(questionIdx: number, optionIdx: number) {
    if (submitted) return; // Lock in once submitted
    setSelected((prev) => {
      const copy = [...prev];
      copy[questionIdx] = optionIdx;
      return copy;
    });
  }

  function handleSubmit() {
    if (selected.some((s) => s === null)) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitted(true);
  }

  function handleRetry() {
    setSelected(new Array(quiz!.questions.length).fill(null));
    setSubmitted(false);
  }

  // ── No text ──
  if (!file.extracted_text) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Quiz requires text-based PDFs.</p>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="glass-card p-10 text-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
        <p className="font-medium mb-1">Creating your quiz…</p>
        <p className="text-slate-400 text-sm">Hang tight, this takes ~15 seconds.</p>
      </div>
    );
  }

  // ── No quiz yet ──
  if (!quiz) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Generate a quiz</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
          5 multiple-choice questions based on your document. Test yourself before the exam.
        </p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button onClick={generateQuiz} className="btn-primary inline-flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Generate Quiz
        </button>
      </div>
    );
  }

  const questions: QuizQuestion[] = quiz.questions;
  const score = submitted
    ? questions.filter((q, i) => selected[i] === q.correct_index).length
    : 0;
  const total = questions.length;

  // ── Score screen ──
  if (submitted) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="space-y-5">
        {/* Score banner */}
        <div className={cn(
          'glass-card p-6 text-center',
          pct >= 80 ? 'border-emerald-500/30' : pct >= 50 ? 'border-amber-500/30' : 'border-red-500/30'
        )}>
          <Trophy className={cn('w-10 h-10 mx-auto mb-3', pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400')} />
          <p className="text-3xl font-bold mb-1">{score}/{total}</p>
          <p className="text-slate-400 text-sm">{pct}% correct</p>
          <p className="text-sm mt-2">
            {pct === 100 ? '🎉 Perfect score!' : pct >= 80 ? 'Great job!' : pct >= 50 ? 'Not bad — review the explanations below.' : 'Keep studying — you\'ve got this!'}
          </p>
        </div>

        {/* Review all questions */}
        <div className="space-y-4">
          {questions.map((q, qi) => {
            const isCorrect = selected[qi] === q.correct_index;
            return (
              <div key={qi} className="glass-card p-5">
                <p className="font-medium text-sm mb-3">
                  <span className="text-slate-500 mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2 mb-3">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm flex items-center gap-2',
                        oi === q.correct_index
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : oi === selected[qi]
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-white/5 text-slate-400'
                      )}
                    >
                      {oi === q.correct_index ? (
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : oi === selected[qi] ? (
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5" />
                      )}
                      {opt}
                    </div>
                  ))}
                </div>
                {!isCorrect && (
                  <p className="text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRetry} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Retry quiz
          </button>
          <button onClick={generateQuiz} className="btn-secondary flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            New questions
          </button>
        </div>
      </div>
    );
  }

  // ── Active quiz ──
  const allAnswered = selected.every((s) => s !== null);

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="glass-card p-5">
          <p className="font-medium text-sm mb-4">
            <span className="text-slate-500 mr-2">Q{qi + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => handleSelect(qi, oi)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 border',
                  selected[qi] === oi
                    ? 'bg-violet-600/30 border-violet-500/60 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                )}
              >
                <span className="text-slate-500 mr-2 font-mono text-xs">
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered}
        className="btn-primary w-full"
      >
        Submit answers
      </button>
    </div>
  );
}
