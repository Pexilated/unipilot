// ===========================================
// src/app/api/chat/route.ts
// Handles one chat turn — receives the user's message
// + conversation history, returns the AI's reply,
// and saves both messages to the DB.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithPdf } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { file_id, message, history } = await request.json();

    if (!file_id || !message) {
      return NextResponse.json({ error: 'file_id and message are required' }, { status: 400 });
    }

    // Fetch file (must be owned by this user)
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

    // Call OpenAI with the PDF text + conversation history
    const reply = await chatWithPdf(file.extracted_text, [
      ...(history || []),
      { role: 'user', content: message },
    ]);

    // Save both the user message and AI reply to the DB
    await supabase.from('chat_messages').insert([
      { file_id, user_id: user.id, role: 'user',      content: message },
      { file_id, user_id: user.id, role: 'assistant', content: reply  },
    ]);

    return NextResponse.json({ message: reply });

  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
