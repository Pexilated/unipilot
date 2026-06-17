// ===========================================
// src/app/api/quiz/route.ts
// Generates quiz questions from a file's extracted text.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuiz } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { file_id } = await request.json();
    if (!file_id) return NextResponse.json({ error: 'file_id is required' }, { status: 400 });

    // Fetch file (user must own it)
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('extracted_text')
      .eq('id', file_id)
      .eq('user_id', user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (!file.extracted_text) {
      return NextResponse.json({ error: 'No text available in this file' }, { status: 400 });
    }

    // Generate 5 questions
    const questions = await generateQuiz(file.extracted_text, 5);

    // Save to DB (each generation creates a new quiz row)
    const { data: saved, error: dbError } = await supabase
      .from('quizzes')
      .insert({ file_id, user_id: user.id, questions })
      .select()
      .single();

    if (dbError) {
      console.error('DB error saving quiz:', dbError);
      return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
    }

    return NextResponse.json({ quiz: saved });

  } catch (err) {
    console.error('Quiz error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
