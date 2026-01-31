import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/security/token';
import { getSession } from '@/lib/session-store';
import { getSessionKV } from '@/lib/kv-session';
import { readTestSession } from '@/lib/test-pending-notes';

/**
 * GET /api/flashcards?token=xxx
 * Returns full flashcards for a valid one-time access token (after payment).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  let flashcards = getSession(payload.sessionId);
  if (!flashcards) {
    flashcards = await getSessionKV(payload.sessionId);
  }
  if (!flashcards && process.env.SKIP_PAYMENT_FOR_TEST === '1') {
    flashcards = await readTestSession(payload.sessionId);
  }
  if (!flashcards) {
    return NextResponse.json({ error: 'Session expired or not found' }, { status: 404 });
  }
  return NextResponse.json({ flashcards });
}
