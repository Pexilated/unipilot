// ===========================================
// src/types/index.ts
// Central place for all TypeScript types
// ===========================================

// ----- Database Row Types -----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  size_bytes: number | null;
  page_count: number | null;
  extracted_text: string | null;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  file_id: string;
  user_id: string;
  content: string;
  key_points: string[];
  created_at: string;
}

// A single quiz question with 4 options and the correct answer index
export interface QuizQuestion {
  question: string;
  options: [string, string, string, string]; // Always exactly 4 options
  correct_index: number;                     // 0, 1, 2, or 3
  explanation: string;                       // Why that answer is correct
}

export interface Quiz {
  id: string;
  file_id: string;
  user_id: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  file_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ----- API Response Types -----

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface UploadResponse {
  file_id: string;
  name: string;
  status: string;
}

export interface SummaryResponse {
  summary: string;
  key_points: string[];
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface ChatResponse {
  message: string;
}

// ----- UI State Types -----

export type TabType = 'summary' | 'quiz' | 'chat';

export interface QuizState {
  currentQuestion: number;
  selectedAnswers: (number | null)[];
  submitted: boolean;
  score: number;
}
