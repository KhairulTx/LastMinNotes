/**
 * POST /api/initiate-payment
 * Store notes in Redis and return payment (or unlock) URL.
 * Using an API route ensures the Redis write runs in the same serverless context
 * as /api/unlock and /api/toyyibpay/callback, so session persists after payment.
 */
import { NextRequest, NextResponse } from 'next/server';
import { setPendingNotes, setPaymentVerified } from '@/lib/session-store';
import { setPendingNotesKV, getPendingNotesKV, setPaymentVerifiedKV, isRedisConfigured } from '@/lib/kv-session';
import { writeTestPendingNotes } from '@/lib/test-pending-notes';
import { normalizeText } from '@/lib/apify/client';
import { getPaymentUrl } from '@/app/generate/actions';

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawText = typeof body.text === 'string' ? body.text : '';
    const returnUrlBase = typeof body.returnUrlBase === 'string' ? body.returnUrlBase.trim() : '';

    const text = normalizeText(rawText).trim();
    if (!text || text.length < 50) {
      return NextResponse.json(
        { ok: false, error: 'Please paste at least a short paragraph of notes (50+ characters).' },
        { status: 400 }
      );
    }
    if (text.length > 50000) {
      return NextResponse.json(
        { ok: false, error: 'Text is too long. Please keep under ~50,000 characters.' },
        { status: 400 }
      );
    }
    if (!returnUrlBase) {
      return NextResponse.json(
        { ok: false, error: 'Missing returnUrlBase.' },
        { status: 400 }
      );
    }

    const sessionId = generateSessionId();
    setPendingNotes(sessionId, text);

    if (process.env.SKIP_PAYMENT_FOR_TEST !== '1') {
      const redisOk = await isRedisConfigured();
      if (!redisOk) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Session storage is not set up. In Vercel: Project → Storage → Create Database (KV) → Connect to this project (Production).',
          },
          { status: 503 }
        );
      }
    }

    await setPendingNotesKV(sessionId, text);

    // Verify write so we never redirect to payment unless session is in Redis (fixes "session expired" after payment).
    const stored = await getPendingNotesKV(sessionId);
    if (!stored) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Could not save your session. Please try again. If this keeps happening, check that Redis (KV) is connected for Production and redeploy.",
        },
        { status: 503 }
      );
    }

    if (process.env.SKIP_PAYMENT_FOR_TEST === '1') {
      await writeTestPendingNotes(sessionId, text);
      setPaymentVerified(sessionId);
      await setPaymentVerifiedKV(sessionId);
      const url = `${returnUrlBase}/unlock?session=${encodeURIComponent(sessionId)}`;
      return NextResponse.json({ ok: true, url });
    }

    const result = await getPaymentUrl(sessionId, returnUrlBase);
    if ('error' in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: result.url });
  } catch (e) {
    console.error('Initiate payment error:', e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
