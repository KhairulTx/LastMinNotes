import { NextRequest, NextResponse } from 'next/server';
import { runDocumentExtractor, normalizeText } from '@/lib/apify/client';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl, mimeType } = body as { fileUrl?: string; mimeType?: string };
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json({ error: 'fileUrl required' }, { status: 400 });
    }
    const rawText = await runDocumentExtractor(fileUrl, { mimeType });
    const text = normalizeText(rawText);
    return NextResponse.json({ text });
  } catch (e) {
    console.error('Apify extract error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
