import { NextRequest, NextResponse } from 'next/server';
import { summarizeForExam } from '@/lib/ai/summarize';

export const maxDuration = 30;

/**
 * AI Summarization API
 *
 * Add your OpenAI API key in .env.local:
 *   OPENAI_API_KEY=sk-...
 *
 * POST body: { "text": "raw study material..." }
 * Returns: { "summary": "bullet point summary..." }
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Add it in .env.local' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const text = (body?.text ?? '').trim();
    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }
    const summary = await summarizeForExam(text);
    return NextResponse.json({ summary });
  } catch (e) {
    console.error('Summarize error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Summarization failed' },
      { status: 500 }
    );
  }
}
