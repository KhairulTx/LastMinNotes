import { NextRequest, NextResponse } from 'next/server';
import { createBill } from '@/lib/payments/toyyibpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, returnUrl } = body as { sessionId?: string; returnUrl?: string };
    if (!sessionId || !returnUrl) {
      return NextResponse.json(
        { error: 'sessionId and returnUrl required' },
        { status: 400 }
      );
    }
    const { billCode, paymentUrl } = await createBill({
      amount: 1, // RM1
      sessionId,
      returnUrl,
    });
    return NextResponse.json({ billCode, paymentUrl });
  } catch (e) {
    console.error('Create bill error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create bill' },
      { status: 500 }
    );
  }
}
