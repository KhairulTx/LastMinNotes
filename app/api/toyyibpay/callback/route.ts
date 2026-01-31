import { NextRequest, NextResponse } from 'next/server';
import { verifyCallbackPayload } from '@/lib/payments/toyyibpay';

/**
 * ToyyibPay callback (POST). Called by ToyyibPay when payment is completed.
 * No Redis. We just acknowledge so ToyyibPay is happy; payment is verified via getBillTransactions when user hits /unlock.
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
    return new NextResponse('OK', { status: 200 });
  } catch (e) {
    console.error('Callback error:', e);
    return new NextResponse('Callback error', { status: 500 });
  }
}
