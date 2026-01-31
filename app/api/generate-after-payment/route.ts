/**
 * POST /api/generate-after-payment
 * No Redis. Client sends orderId, notes (from localStorage), billCode (from return URL).
 * We verify payment via ToyyibPay getBillTransactions; if paid, generate flashcards and return them.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBillTransactions } from '@/lib/payments/toyyibpay';
import { normalizeText } from '@/lib/apify/client';
import { summarizeForExam } from '@/lib/ai/summarize';
import { generateFlashcards } from '@/lib/ai/flashcard';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes : '';
    const billCode = typeof body.billCode === 'string' ? body.billCode.trim() : '';
    const statusId = typeof body.status_id === 'string' ? body.status_id : '';

    if (!orderId || !notes) {
      return NextResponse.json(
        { error: 'Missing orderId or notes. Use the same browser where you started payment.' },
        { status: 400 }
      );
    }

    const text = normalizeText(notes).trim();
    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Notes too short. Please start again from the generate page.' },
        { status: 400 }
      );
    }

    const skipPayment = process.env.SKIP_PAYMENT_FOR_TEST === '1';

    if (!skipPayment) {
      if (!billCode) {
        return NextResponse.json(
          { error: 'Missing bill code from payment. Please return from the payment page with the full URL.' },
          { status: 400 }
        );
      }
      if (statusId !== '1') {
        return NextResponse.json(
          { error: 'Payment not completed. Please complete payment first.' },
          { status: 402 }
        );
      }

      const transactions = await getBillTransactions(billCode, '1');
      const paid = Array.isArray(transactions) && transactions.some(
        (t) => String(t.billExternalReferenceNo || '').trim() === orderId
      );
      if (!paid) {
        return NextResponse.json(
          { error: 'Payment could not be verified. Please complete payment and try again.' },
          { status: 402 }
        );
      }
    }

    const summary = await summarizeForExam(text);
    const flashcards = await generateFlashcards(summary);
    if (flashcards.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate flashcards from your notes.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ flashcards });
  } catch (e) {
    console.error('Generate after payment error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
