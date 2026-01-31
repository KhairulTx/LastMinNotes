'use server';

import { summarizeForExam } from '@/lib/ai/summarize';
import { generateFlashcards } from '@/lib/ai/flashcard';
import { setSession, setPendingNotes, setPaymentVerified } from '@/lib/session-store';
import { setPendingNotesKV, getPendingNotesKV, setPaymentVerifiedKV } from '@/lib/kv-session';
import { writeTestPendingNotes } from '@/lib/test-pending-notes';
import { normalizeText } from '@/lib/apify/client';
import { SAMPLE_FLASHCARDS } from '@/lib/sample-flashcards';
import type { Flashcard } from '@/types/flashcard';

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Pay-first flow: store notes, show sample preview, redirect to payment. */
export type InitiatePaymentResult =
  | { ok: true; sessionId: string; url: string }
  | { ok: false; error: string };

export async function initiatePayment(rawText: string, returnUrlBase: string): Promise<InitiatePaymentResult> {
  const text = normalizeText(rawText).trim();
  if (!text || text.length < 50) {
    return { ok: false, error: 'Please paste at least a short paragraph of notes (50+ characters).' };
  }
  if (text.length > 50000) {
    return { ok: false, error: 'Text is too long. Please keep under ~50,000 characters.' };
  }

  try {
    const sessionId = generateSessionId();
    setPendingNotes(sessionId, text);
    // Persist notes so unlock API can read after payment (different serverless instance). Use KV in production; file only in test mode (Vercel fs is read-only).
    await setPendingNotesKV(sessionId, text);
    if (process.env.SKIP_PAYMENT_FOR_TEST === '1') {
      await writeTestPendingNotes(sessionId, text);
    }

    // In production, never redirect to payment unless we can read back the session (proves Redis is working).
    if (process.env.SKIP_PAYMENT_FOR_TEST !== '1') {
      const stored = await getPendingNotesKV(sessionId);
      if (!stored) {
        return {
          ok: false,
          error: "We couldn't save your session. Please try again. (If this keeps happening, add Upstash Redis: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your server environment.)",
        };
      }
    }

    // --- TEST MODE: skip real payment, go straight to unlock (set SKIP_PAYMENT_FOR_TEST=1 in .env.local). ---
    if (process.env.SKIP_PAYMENT_FOR_TEST === '1') {
      setPaymentVerified(sessionId);
      await setPaymentVerifiedKV(sessionId);
      const url = `${returnUrlBase}/unlock?session=${encodeURIComponent(sessionId)}`;
      return { ok: true, sessionId, url };
    }

    const result = await getPaymentUrl(sessionId, returnUrlBase);
    if ('error' in result) return { ok: false, error: result.error };
    return { ok: true, sessionId, url: result.url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Payment initiation failed' };
  }
}

/** Sample cards for marketing preview (no AI cost). */
export async function getSamplePreview(): Promise<{ preview: Flashcard[]; total: number }> {
  return { preview: SAMPLE_FLASHCARDS, total: SAMPLE_FLASHCARDS.length };
}

export async function getPaymentUrl(sessionId: string, returnUrlBase: string): Promise<{ url: string } | { error: string }> {
  const returnUrl = `${returnUrlBase}/unlock?session=${encodeURIComponent(sessionId)}`;
  try {
    const { createBill } = await import('@/lib/payments/toyyibpay');
    const { paymentUrl } = await createBill({
      amount: 1,
      sessionId,
      returnUrl,
    });
    return { url: paymentUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Payment error' };
  }
}
