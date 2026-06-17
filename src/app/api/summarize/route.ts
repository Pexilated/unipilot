// ===========================================
// src/app/api/summarize/route.ts
// Receives a file_id, fetches the extracted text,
// calls the AI, and saves the result to the DB.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummary } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { file_id } = await request.json();
    if (!file_id) return NextResponse.json({ error: 'file_id is required' }, { status: 400 });

    // Fetch the file (RLS ensures this user owns it)
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

    // Generate summary via OpenAI
    const { summary, key_points } = await generateSummary(file.extracted_text);

    // Upsert — replace if already exists for this file
    const { data: saved, error: dbError } = await supabase
      .from('summaries')
      .upsert(
        {
          file_id,
          user_id: user.id,
          content: summary,
          key_points,
        },
        { onConflict: 'file_id' }
      )
      .select()
      .single();

    if (dbError) {
      console.error('DB error saving summary:', dbError);
      return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
    }

    return NextResponse.json({ summary: saved });

  } catch (err) {
    console.error('Summarize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
