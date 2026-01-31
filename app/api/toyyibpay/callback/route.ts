import { NextRequest, NextResponse } from 'next/server';
import { verifyCallbackPayload } from '@/lib/payments/toyyibpay';
import { setPaymentVerified } from '@/lib/session-store';
import { setPaymentVerifiedKV } from '@/lib/kv-session';

/**
 * ToyyibPay callback (POST). Called by ToyyibPay when payment is completed.
 * Payload: refno, status (1=success), billcode, order_id (our sessionId), amount
 * On success: mark payment verified. Flashcards are generated on first unlock request.
 */
export async function POST(request: NextRequest) {
  try {
    let payload: Record<string, string>;
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      payload = typeof body === 'object' && body !== null ? body : {};
    } else {
      const formData = await request.formData();
      payload = Array.from(formData.entries()).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v ?? '') }),
        {} as Record<string, string>
      );
    }

    const status = String(payload.status ?? payload.status_id ?? '');
    const amount = String(payload.amount ?? '');
    if (!verifyCallbackPayload({ ...payload, status, amount })) {
      return new NextResponse('Payment verification failed', { status: 400 });
    }

    // ToyyibPay may send our sessionId in order_id, ref1, ref2, or billExternalReferenceNo
    const sessionId = [
      payload.order_id,
      payload.ref1,
      payload.ref2,
      payload.referenceNo,
      payload.billExternalReferenceNo,
    ]
      .find((v) => typeof v === 'string' && v.trim().length > 0)
      ?.trim();
    if (!sessionId) {
      return new NextResponse('Missing order_id/ref1', { status: 400 });
    }

    setPaymentVerified(sessionId);
    await setPaymentVerifiedKV(sessionId);
    return new NextResponse('OK', { status: 200 });
  } catch (e) {
    console.error('Callback error:', e);
    return new NextResponse('Callback error', { status: 500 });
  }
}
