'use client';
// ===========================================
// src/components/files/FileStudyTabs.tsx
// The tab switcher on the file detail page.
// Controls which panel (Summary / Quiz / Chat) is shown.
// ===========================================

import { useState } from 'react';
import { Brain, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import SummaryView from '@/components/ai/SummaryView';
import QuizView from '@/components/ai/QuizView';
import ChatView from '@/components/ai/ChatView';
import type { FileRecord, Summary, Quiz, ChatMessage } from '@/types';

type Tab = 'summary' | 'quiz' | 'chat';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: 'Summary', icon: Brain },
  { id: 'quiz',    label: 'Quiz',    icon: Zap },
  { id: 'chat',    label: 'Chat',    icon: MessageSquare },
];

interface FileStudyTabsProps {
  file: FileRecord;
  initialSummary: Summary | null;
  initialQuiz: Quiz | null;
  initialMessages: ChatMessage[];
}

export default function FileStudyTabs({
  file,
  initialSummary,
  initialQuiz,
  initialMessages,
}: FileStudyTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'summary' && (
        <SummaryView file={file} initialSummary={initialSummary} />
      )}
      {activeTab === 'quiz' && (
        <QuizView file={file} initialQuiz={initialQuiz} />
      )}
      {activeTab === 'chat' && (
        <ChatView file={file} initialMessages={initialMessages} />
      )}
    </div>
  );
}
