import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  getPendingNotes,
  isPaymentVerified,
  setSession,
  setGenerating,
  clearGenerating,
  isGenerating,
} from '@/lib/session-store';
import { getPendingNotesKV, isPaymentVerifiedKV, getSessionKV, setSessionKV, isRedisConfigured } from '@/lib/kv-session';
import { readTestPendingNotes, writeTestSession, readTestSession } from '@/lib/test-pending-notes';
import { createAccessToken } from '@/lib/security/token';
import { summarizeForExam } from '@/lib/ai/summarize';
import { generateFlashcards } from '@/lib/ai/flashcard';

/**
 * GET /api/unlock?session=xxx
 * After payment, user is redirected to /unlock?session=xxx (return URL).
 * Pay-first flow: if flashcards don't exist yet, we generate them from pending notes.
 */
export async function GET(request: NextRequest) {
  // ToyyibPay may redirect with order_id or ref1 instead of session; accept any as sessionId.
  const sessionId = [
    request.nextUrl.searchParams.get('session'),
    request.nextUrl.searchParams.get('order_id'),
    request.nextUrl.searchParams.get('ref1'),
  ]
    .find((v) => typeof v === 'string' && v.trim().length > 0)
    ?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: 'session required (or order_id / ref1 from payment)' }, { status: 400 });
  }

  // Already have flashcards? Create one-time token and return. (Check KV/disk if different process.)
  let existingFlashcards = getSession(sessionId);
  if (!existingFlashcards) {
    existingFlashcards = await getSessionKV(sessionId);
  }
  if (!existingFlashcards) {
    existingFlashcards = await readTestSession(sessionId);
  }
  if (existingFlashcards && existingFlashcards.length > 0) {
    const token = await createAccessToken(sessionId);
    return NextResponse.json({ token });
  }

  let notes = getPendingNotes(sessionId);
  if (!notes) {
    notes = await getPendingNotesKV(sessionId);
  }
  if (!notes) {
    notes = await readTestPendingNotes(sessionId);
  }
  if (!notes) {
    const redisOk = await isRedisConfigured();
    const message = redisOk
      ? 'Session expired. Please start over from the generate page.'
      : 'Session storage is not configured on the server. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (e.g. in Vercel env) so your session persists after payment.';
    return NextResponse.json(
      { error: message },
      { status: redisOk ? 404 : 503 }
    );
  }

  // Must have verified payment to generate (skip this check when SKIP_PAYMENT_FOR_TEST=1 so you can test without payment).
  const skipPaymentForTest = process.env.SKIP_PAYMENT_FOR_TEST === '1';
  const paymentVerified = isPaymentVerified(sessionId) || (await isPaymentVerifiedKV(sessionId));
  if (!skipPaymentForTest && !paymentVerified) {
    return NextResponse.json(
      { error: 'Payment not verified yet. Please wait a moment and refresh.' },
      { status: 404 }
    );
  }

  // Prevent concurrent generation for same session.
  if (isGenerating(sessionId)) {
    return NextResponse.json({ status: 'generating' }, { status: 202 });
  }

  setGenerating(sessionId);
  try {
    const summary = await summarizeForExam(notes);
    const flashcards = await generateFlashcards(summary);
    if (flashcards.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate flashcards from your notes.' },
        { status: 500 }
      );
    }
    setSession(sessionId, flashcards);
    await setSessionKV(sessionId, flashcards);
    if (process.env.SKIP_PAYMENT_FOR_TEST === '1') {
      await writeTestSession(sessionId, flashcards);
    }
    const token = await createAccessToken(sessionId);
    return NextResponse.json({ token });
  } catch (e) {
    console.error('Unlock generation error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generation failed. Please try again.' },
      { status: 500 }
    );
  } finally {
    clearGenerating(sessionId);
  }
}
