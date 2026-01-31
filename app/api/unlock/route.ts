/**
 * GET /api/unlock – no longer used. New flow: pay → return to /unlock?order_id=... → page calls POST /api/generate-after-payment with notes from localStorage.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error:
        'This endpoint is no longer used. Complete payment and return to the unlock page with the full URL (order_id in the link).',
    },
    { status: 410 }
  );
}
