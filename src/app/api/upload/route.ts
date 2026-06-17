// ===========================================
// src/app/api/upload/route.ts
// Handles PDF upload:
//   1. Receives the file from the browser
//   2. Uploads it to Supabase Storage
//   3. Extracts raw text with pdf-parse
//   4. Saves metadata to the 'files' table
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateStoragePath } from '@/lib/utils';
// @ts-ignore — pdf-parse doesn't have great types but works fine
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Make sure user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Parse the incoming multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be smaller than 25 MB' }, { status: 400 });
    }

    // Convert File → Buffer (needed for pdf-parse and Supabase upload)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Step 1: Extract text from the PDF ──
    let extractedText = '';
    let pageCount = 0;

    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 0;
    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr);
      // Not fatal — we still save the file, just without text
    }

    // ── Step 2: Upload the raw PDF to Supabase Storage ──
    const storagePath = generateStoragePath(user.id, file.name);

    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json({ error: 'Failed to store file' }, { status: 500 });
    }

    // ── Step 3: Save file metadata to the database ──
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        name: file.name,
        storage_path: storagePath,
        size_bytes: file.size,
        page_count: pageCount,
        extracted_text: extractedText || null,
        status: extractedText ? 'ready' : 'uploaded',
      })
      .select()
      .single();

    if (dbError || !fileRecord) {
      console.error('DB error:', dbError);
      // Clean up the storage upload since DB failed
      await supabase.storage.from('pdfs').remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 });
    }

    return NextResponse.json({
      file_id: fileRecord.id,
      name: fileRecord.name,
      status: fileRecord.status,
    });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
