// ===========================================
// src/app/page.tsx
// Public landing page — what visitors see at "/"
// ===========================================

import Link from 'next/link';
import { BookOpen, Brain, MessageSquare, Upload, Zap } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Upload Any Lecture PDF',
    description: 'Drop in your lecture slides, textbook chapters, or notes.',
  },
  {
    icon: Brain,
    title: 'AI Summaries Instantly',
    description: 'Get a clear, concise summary and key points in seconds.',
  },
  {
    icon: Zap,
    title: 'Practice with Quizzes',
    description: 'Auto-generated multiple-choice questions test your knowledge.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with Your Notes',
    description: 'Ask anything about your uploaded document and get answers.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">UniPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-24 pb-20 text-center">
        <div className="max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-powered study assistant
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Study smarter,{' '}
            <span className="gradient-text">not harder</span>
          </h1>

          {/* Subheadline */}
          <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Upload your lecture PDFs. Get instant AI summaries, practice quizzes,
            and a chat assistant that knows your material inside out.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base py-4 px-8 w-full sm:w-auto">
              Start studying free →
            </Link>
            <Link href="/login" className="btn-secondary text-base py-4 px-8 w-full sm:w-auto">
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-4">Everything you need to ace your exams</h2>
          <p className="text-center text-slate-400 mb-14">Four tools, one upload.</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6">
                <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center glass-card p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to study smarter?</h2>
          <p className="text-slate-400 mb-8">Free to start. No credit card needed.</p>
          <Link href="/signup" className="btn-primary text-base py-4 px-10 inline-block">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-slate-500 text-sm">
        © 2025 UniPilot. Built for students, by students.
      </footer>
    </div>
  );
}
