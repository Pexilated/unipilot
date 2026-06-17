'use client';
// ===========================================
// src/components/ai/ChatView.tsx
// Chat interface. User types a message, the AI answers
// based only on the uploaded PDF content.
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileRecord, ChatMessage } from '@/types';

interface ChatViewProps {
  file: FileRecord;
  initialMessages: ChatMessage[];
}

const SUGGESTED_QUESTIONS = [
  'What is the main topic of this document?',
  'Summarise the key concepts in simple terms.',
  'What are the most important takeaways?',
  'Are there any formulas or definitions I should know?',
];

export default function ChatView({ file, initialMessages }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    setInput('');
    setLoading(true);

    // Optimistically add the user message to the UI immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      file_id: file.id,
      user_id: '',
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: file.id,
          message: messageText,
          // Send conversation history for context
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get a response');

      // Add the AI's reply
      const assistantMsg: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        file_id: file.id,
        user_id: '',
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      // Show error as an assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          file_id: file.id,
          user_id: '',
          role: 'assistant',
          content: `Sorry, something went wrong. ${err instanceof Error ? err.message : ''}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!file.extracted_text) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chat requires text-based PDFs.</p>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col" style={{ height: '600px' }}>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Empty state with suggested questions */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="font-semibold mb-1">Ask anything about this document</h3>
            <p className="text-slate-400 text-sm mb-6">Try one of these to get started:</p>
            <div className="grid gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-sm text-left px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-slate-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-violet-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-white/10 text-slate-200 rounded-tl-sm'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 bg-violet-600/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              <span className="text-slate-400 text-sm">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 p-4">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document…"
            rows={1}
            className="flex-1 input-base resize-none py-2.5 text-sm"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary p-2.5 flex-shrink-0 !px-3"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
