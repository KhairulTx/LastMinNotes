/**
 * ToyyibPay integration for RM1 bill creation and callback verification.
 *
 * Add to .env.local (restart dev server after changes):
 *   TOYYIBPAY_USER_SECRET_KEY=xxx   (or TOYYIBPAY_USER_SECRET / TOYYIBPAY_SECRET_KEY)
 *   TOYYIBPAY_CATEGORY_CODE=xxx     (or TOYYIBPAY_CATEGORY)
 *   APP_URL=http://localhost:3000   (for callback URL; use your domain in production)
 *
 * Get keys from toyyibpay.com → Login → User Secret Key, Create Category for Category Code.
 */

const TOYYIBPAY_API = process.env.TOYYIBPAY_SANDBOX === '1'
  ? 'https://dev.toyyibpay.com/index.php/api'
  : 'https://toyyibpay.com/index.php/api';

export interface CreateBillParams {
  amount: number; // in MYR
  sessionId: string;
  returnUrl: string;
}

export interface ToyyibPayBillResponse {
  BillCode: string;
  BillName: string;
  BillAmount: number;
  BillDescription: string;
  BillTo: string;
  BillEmail: string;
  BillPhone: string;
  BillPaymentStatus: string;
  BillPaymentAmount: string;
  BillPaymentDate: string;
  BillPaymentTransactionId: string;
  BillPaymentChannel: string;
  BillPaymentBank: string;
  BillPaymentSlip: string;
  BillPaymentSlip2: string;
  BillPaymentSlip3: string;
  BillPaymentSlip4: string;
  BillPaymentSlip5: string;
  BillPaymentSlip6: string;
  BillPaymentSlip7: string;
  BillPaymentSlip8: string;
  BillPaymentSlip9: string;
  BillPaymentSlip10: string;
  BillPaymentDue: string;
  BillPaymentUrl: string;
  BillPaymentUrl2: string;
  BillPaymentUrl3: string;
  BillPaymentUrl4: string;
  BillPaymentUrl5: string;
  BillPaymentUrl6: string;
  BillPaymentUrl7: string;
  BillPaymentUrl8: string;
  BillPaymentUrl9: string;
  BillPaymentUrl10: string;
  BillPaymentUrl11: string;
  BillPaymentUrl12: string;
  BillPaymentUrl13: string;
  BillPaymentUrl14: string;
  BillPaymentUrl15: string;
  BillPaymentUrl16: string;
  BillPaymentUrl17: string;
  BillPaymentUrl18: string;
  BillPaymentUrl19: string;
  BillPaymentUrl20: string;
  BillPaymentUrl21: string;
  BillPaymentUrl22: string;
  BillPaymentUrl23: string;
  BillPaymentUrl24: string;
  BillPaymentUrl25: string;
  BillPaymentUrl26: string;
  BillPaymentUrl27: string;
  BillPaymentUrl28: string;
  BillPaymentUrl29: string;
  BillPaymentUrl30: string;
  BillPaymentUrl31: string;
  BillPaymentUrl32: string;
  BillPaymentUrl33: string;
  BillPaymentUrl34: string;
  BillPaymentUrl35: string;
  BillPaymentUrl36: string;
  BillPaymentUrl37: string;
  BillPaymentUrl38: string;
  BillPaymentUrl39: string;
  BillPaymentUrl40: string;
  BillPaymentUrl41: string;
  BillPaymentUrl42: string;
  BillPaymentUrl43: string;
  BillPaymentUrl44: string;
  BillPaymentUrl45: string;
  BillPaymentUrl46: string;
  BillPaymentUrl47: string;
  BillPaymentUrl48: string;
  BillPaymentUrl49: string;
  BillPaymentUrl50: string;
  ref1: string;
  ref2: string;
  ref3: string;
  ref4: string;
  ref5: string;
  ref6: string;
  ref7: string;
  ref8: string;
  ref9: string;
  ref10: string;
  Status: string;
  Message: string;
}

export async function createBill(params: CreateBillParams): Promise<{ billCode: string; paymentUrl: string }> {
  const { amount, sessionId, returnUrl } = params;
  const userSecretKey =
    process.env.TOYYIBPAY_USER_SECRET_KEY ||
    process.env.TOYYIBPAY_USER_SECRET ||
    process.env.TOYYIBPAY_SECRET_KEY;
  const categoryCode =
    process.env.TOYYIBPAY_CATEGORY_CODE ||
    process.env.TOYYIBPAY_CATEGORY;
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!userSecretKey || !categoryCode) {
    throw new Error(
      'ToyyibPay not configured. Add to .env.local: TOYYIBPAY_USER_SECRET_KEY (or TOYYIBPAY_USER_SECRET) and TOYYIBPAY_CATEGORY_CODE (or TOYYIBPAY_CATEGORY). Get these from toyyibpay.com dashboard.'
    );
  }

  const form = new URLSearchParams({
    userSecretKey,
    categoryCode,
    billName: 'LastMin_Notes_Flashcard_Unlock',
    billDescription: `Unlock_flashcards_RM${amount}`,
    billPriceSetting: '1',
    billPayorInfo: '0',
    billAmount: String(Math.round(amount * 100)), // ToyyibPay uses cent: 100 = RM1
    billReturnUrl: returnUrl,
    billCallbackUrl: `${baseUrl}/api/toyyibpay/callback`,
    billExternalReferenceNo: sessionId,
    billTo: '',
    billEmail: '',
    billPhone: '',
    billSplitPayment: '0',
    billSplitPaymentArgs: '',
    billPaymentChannel: '2', // FPX & Credit Card
    billContentEmail: '',
    billChargeToCustomer: '0',
  });

  const res = await fetch(`${TOYYIBPAY_API}/createBill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const json = await res.json();
  // ToyyibPay returns [{ BillCode: "xxx" }]
  const data = Array.isArray(json) ? json[0] : json;
  const billCode = data?.BillCode;
  if (!billCode) {
    throw new Error(data?.Message || json?.Message || 'Failed to create bill');
  }

  const base = process.env.TOYYIBPAY_SANDBOX === '1' ? 'https://dev.toyyibpay.com' : 'https://toyyibpay.com';
  const paymentUrl = `${base}/${billCode}`;
  return { billCode, paymentUrl };
}

/** Callback POST: refno, status (1=success, 2=pending, 3=fail), billcode, order_id, amount */
export function verifyCallbackPayload(payload: {
  billcode?: string;
  status?: string;
  status_id?: string;
  amount?: string;
  order_id?: string;
}): boolean {
  const status = payload.status ?? payload.status_id;
  if (status !== '1') return false;
  const amountCent = parseInt(payload.amount || '0', 10);
  if (amountCent < 100) return false; // RM1 = 100 cent
  return true;
}
