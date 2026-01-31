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
    const formData = await request.formData();
    const payload = {
      refno: formData.get('refno') as string,
      status: String(formData.get('status') ?? formData.get('status_id') ?? ''),
      billcode: formData.get('billcode') as string,
      order_id: (formData.get('order_id') as string) ?? (formData.get('ref1') as string),
      amount: formData.get('amount') as string,
    };

    if (!verifyCallbackPayload(payload)) {
      return new NextResponse('Payment verification failed', { status: 400 });
    }

    const sessionId = payload.order_id;
    if (!sessionId) {
      return new NextResponse('Missing order_id', { status: 400 });
    }

    setPaymentVerified(sessionId);
    await setPaymentVerifiedKV(sessionId);
    return new NextResponse('OK', { status: 200 });
  } catch (e) {
    console.error('Callback error:', e);
    return new NextResponse('Callback error', { status: 500 });
  }
}
