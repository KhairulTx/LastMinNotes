/**
 * POST /api/initiate-payment
 * No Redis. Creates ToyyibPay bill with orderId; client stores notes in localStorage and redirects.
 * After payment, user returns to /unlock?order_id=xxx&billcode=yyy&status_id=1 and we verify via getBillTransactions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { normalizeText } from '@/lib/apify/client';

function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
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

    const orderId = generateOrderId();
    const returnUrl = `${returnUrlBase}/unlock?order_id=${encodeURIComponent(orderId)}`;

    if (process.env.SKIP_PAYMENT_FOR_TEST === '1') {
      const url = `${returnUrlBase}/unlock?order_id=${encodeURIComponent(orderId)}&status_id=1&billcode=test`;
      return NextResponse.json({ ok: true, url, orderId });
    }

    const { createBill } = await import('@/lib/payments/toyyibpay');
    const { paymentUrl } = await createBill({
      amount: 1,
      sessionId: orderId,
      returnUrl,
    });
    return NextResponse.json({ ok: true, url: paymentUrl, orderId });
  } catch (e) {
    console.error('Initiate payment error:', e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
