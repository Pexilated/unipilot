// ===========================================
// src/app/layout.tsx
// Root layout — wraps every page in the app
// ===========================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UniPilot — Study Smarter',
  description: 'AI-powered university assistant. Upload lecture PDFs, get summaries, practice with quizzes, and chat with your notes.',
  keywords: ['study', 'university', 'AI', 'PDF', 'quiz', 'summary'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
