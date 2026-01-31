import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai/flashcard';

export const maxDuration = 30;

/**
 * Flashcard generation API (Step 2 of AI pipeline).
 * Uses same OPENAI_API_KEY as summarize (in .env.local).
 *
 * POST body: { "summary": "bullet point summary from /api/ai/summarize" }
 * Returns: { "flashcards": [{ id, question, answer }, ...] }
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
    const summary = (body?.summary ?? '').trim();
    if (!summary) {
      return NextResponse.json({ error: 'summary required' }, { status: 400 });
    }
    const flashcards = await generateFlashcards(summary);
    return NextResponse.json({ flashcards });
  } catch (e) {
    console.error('Flashcards error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Flashcard generation failed' },
      { status: 500 }
    );
  }
}
