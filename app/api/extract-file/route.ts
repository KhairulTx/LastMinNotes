import { NextRequest, NextResponse } from 'next/server';
import { normalizeText } from '@/lib/apify/client';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/extract-file
 * Accepts multipart form with "file" (PDF or DOCX). Extracts text server-side.
 * Fixes client-side pdfjs-dist/Next.js "Object.defineProperty" issue.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text: string;

    if (ext === 'pdf') {
      // Require lib directly to avoid pdf-parse index.js debug block (reads test file from CWD)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdf = require('pdf-parse/lib/pdf-parse.js');
      const data = await pdf(buffer);
      text = (data?.text ?? '').replace(/\s+/g, ' ').trim();
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = (result?.value ?? '').trim();
    } else {
      return NextResponse.json({ error: 'Unsupported type. Use PDF or DOCX.' }, { status: 400 });
    }

    const normalized = normalizeText(text);
    if (!normalized || normalized.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. Try pasting the content instead.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: normalized });
  } catch (e) {
    console.error('Extract file error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
