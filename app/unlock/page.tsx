'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { FlashcardViewer } from '../generate/components/FlashcardViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Flashcard } from '@/types/flashcard';

type Status = 'loading' | 'generating' | 'ready' | 'expired';

function useUnlockParams(): {
  orderId: string | null;
  billCode: string | null;
  statusId: string | null;
  ready: boolean;
} {
  const [params, setParams] = useState<{
    orderId: string | null;
    billCode: string | null;
    statusId: string | null;
    ready: boolean;
  }>({ orderId: null, billCode: null, statusId: null, ready: false });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const orderId = sp.get('order_id') ?? sp.get('session') ?? sp.get('ref1');
    const billCode = sp.get('billcode');
    const statusId = sp.get('status_id');
    setParams({
      orderId: orderId?.trim() ?? null,
      billCode: billCode?.trim() ?? null,
      statusId: statusId?.trim() ?? null,
      ready: true,
    });
  }, []);
  return params;
}

export default function UnlockPage() {
  const { orderId, billCode, statusId, ready } = useUnlockParams();
  const [status, setStatus] = useState<Status>('loading');
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportPdf = useCallback(() => {
    if (!flashcards?.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>LastMin Notes — Flashcards Report</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @page { size: A4; margin: 20mm; }
            @media print {
              html, body { width: 210mm; min-height: 297mm; overflow: visible; }
              body { padding: 0 !important; margin: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .cover { height: 257mm; page-break-after: always; }
              .card { page-break-inside: avoid; }
              .content { padding: 0 !important; }
            }
            body {
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #1a1a1a;
              background: #fff;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 0;
            }
            .content {
              width: 170mm;
              max-width: 170mm;
              margin: 0 auto;
              padding: 0 0 15mm 0;
            }
            .cover {
              width: 170mm;
              height: 257mm;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              padding: 20mm;
              box-sizing: border-box;
            }
            .cover::before {
              content: '';
              display: block;
              width: 40mm;
              height: 2px;
              background: #7c3aed;
              margin-bottom: 8mm;
            }
            .cover h1 { font-size: 22pt; font-weight: 400; letter-spacing: 0.05em; color: #1a1a1a; margin: 0 0 4mm 0; }
            .cover .sub { font-size: 12pt; color: #555; font-weight: 400; margin-bottom: 12mm; }
            .cover .meta { font-size: 10pt; color: #888; margin-top: 8mm; }
            .section-title {
              font-size: 12pt;
              font-weight: 600;
              letter-spacing: 0.03em;
              color: #333;
              margin: 0 0 6mm 0;
              padding-bottom: 3mm;
              border-bottom: 1px solid #e0e0e0;
            }
            .cards-wrap { margin-top: 6mm; }
            .card {
              background: #fff;
              border: 1px solid #e0e0e0;
              border-radius: 2mm;
              padding: 6mm 8mm;
              margin-bottom: 6mm;
              min-height: 0;
            }
            .card .label { font-size: 9pt; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #7c3aed; margin-bottom: 3mm; }
            .card .q { font-size: 11pt; font-weight: 600; line-height: 1.45; color: #1a1a1a; margin-bottom: 4mm; }
            .card .a { font-size: 10.5pt; line-height: 1.5; color: #444; border-top: 1px dashed #e0e0e0; padding-top: 4mm; margin-top: 4mm; }
            .footer { margin-top: 10mm; padding-top: 6mm; border-top: 1px solid #e0e0e0; font-size: 9pt; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cover">
            <h1>LastMin Notes</h1>
            <p class="sub">Study Flashcards</p>
            <p class="meta">${escapeHtml(date)} · ${flashcards.length} card${flashcards.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="content">
            <h2 class="section-title">Flashcards</h2>
            <div class="cards-wrap">
              ${flashcards
                .map(
                  (c, i) => `
              <div class="card">
                <div class="label">Card ${i + 1}</div>
                <p class="q">${escapeHtml(c.question)}</p>
                <p class="a">${escapeHtml(c.answer)}</p>
              </div>
            `
                )
                .join('')}
            </div>
            <div class="footer">Generated by LastMin Notes · lastminnotes.com</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }, [flashcards]);

  useEffect(() => {
    if (!ready) return;
    if (!orderId) {
      setError('Missing order ID. Return from the payment page with the full URL.');
      setStatus('expired');
      return;
    }

    const notes = typeof window !== 'undefined' ? localStorage.getItem(`lastmin_notes_${orderId}`) : null;
    if (!notes) {
      setError('Notes not found. Please complete payment from the same browser where you started.');
      setStatus('expired');
      return;
    }

    setStatus('generating');
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    fetch(`${base}/api/generate-after-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        notes,
        billCode: billCode ?? '',
        status_id: statusId ?? '',
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Something went wrong.');
          setStatus('expired');
          return;
        }
        if (data.flashcards && Array.isArray(data.flashcards)) {
          setFlashcards(data.flashcards);
          setStatus('ready');
          try {
            localStorage.removeItem(`lastmin_notes_${orderId}`);
          } catch (_) {}
        } else {
          setError('No flashcards received.');
          setStatus('expired');
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Request failed.');
        setStatus('expired');
      });
  }, [ready, orderId, billCode, statusId]);

  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <Loader2 className="w-10 h-10 text-foreground animate-spin" />
          <p className="text-muted-foreground mt-2">Loading…</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {status === 'generating' && (
          <Card className="max-w-sm text-center">
            <CardContent className="pt-6 pb-6">
              <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto mb-4" />
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-muted-foreground mt-1">Generating your flashcards…</p>
              <p className="text-xs text-muted-foreground mt-2">This may take 20–30 seconds.</p>
            </CardContent>
          </Card>
        )}

        {status === 'expired' && (
          <Card className="max-w-sm text-center">
            <CardContent className="pt-6 pb-6">
              <p className="text-muted-foreground mb-4">
                {error || 'This link has expired or is invalid.'}
              </p>
              <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background">
                <Link href="/generate">Create new flashcards</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'ready' && flashcards && flashcards.length > 0 && (
          <div className="w-full max-w-lg px-4 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-4 py-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
                  Download before you leave
                </p>
                <p className="text-amber-800 dark:text-amber-200 text-xs mt-0.5">
                  Use the download button above to save your flashcards as PDF before you close this page.
                </p>
              </div>
            </div>
            <FlashcardViewer flashcards={flashcards} onExportPdf={handleExportPdf} />
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
