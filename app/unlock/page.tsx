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

type Status = 'checking' | 'ready' | 'expired' | 'polling';

/** Read token/session from URL on client only (avoids useSearchParams so page can be statically exported). */
function useUnlockParams(): { token: string | null; session: string | null; ready: boolean } {
  const [params, setParams] = useState<{ token: string | null; session: string | null; ready: boolean }>({
    token: null,
    session: null,
    ready: false,
  });
  useEffect(() => {
    const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    setParams({ token: sp.get('token'), session: sp.get('session'), ready: true });
  }, []);
  return params;
}

export default function UnlockPage() {
  const { token: tokenParam, session: sessionParam, ready } = useUnlockParams();
  const [status, setStatus] = useState<Status>('checking');
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWithToken = useCallback(async (token: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch(`${base}/api/flashcards?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to load flashcards');
    }
    const data = await res.json();
    setFlashcards(data.flashcards);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!tokenParam && !sessionParam) {
      setStatus('expired');
      setError('Missing token or session.');
      return;
    }
    if (tokenParam) {
      setStatus('checking');
      fetchWithToken(tokenParam).catch((e) => {
        setError(e.message);
        setStatus('expired');
      });
      return;
    }
    if (!sessionParam) {
      setStatus('expired');
      setError('Missing token or session.');
      return;
    }

    setStatus('polling');
    const interval = setInterval(async () => {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${base}/api/unlock?session=${encodeURIComponent(sessionParam)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        clearInterval(interval);
        clearTimeout(timeout);
        window.history.replaceState({}, '', `${window.location.pathname}?token=${encodeURIComponent(data.token)}`);
        fetchWithToken(data.token).catch((e) => {
          setError(e.message);
          setStatus('expired');
        });
      } else if (res.status === 404 || res.status === 500) {
        clearInterval(interval);
        clearTimeout(timeout);
        setError(data.error || 'Something went wrong.');
        setStatus('expired');
      }
      // 202 = generating, keep polling
    }, 2000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setError('Payment is taking longer than usual. Refresh in a minute or try again.');
      setStatus('expired');
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ready, sessionParam, tokenParam, fetchWithToken]);

  const handleExportPdf = () => {
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
            /* A4: 210mm x 297mm. Content area with 20mm margins = 170mm x 257mm */
            @page {
              size: A4;
              margin: 20mm;
            }
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
            .cover h1 {
              font-size: 22pt;
              font-weight: 400;
              letter-spacing: 0.05em;
              color: #1a1a1a;
              margin: 0 0 4mm 0;
            }
            .cover .sub {
              font-size: 12pt;
              color: #555;
              font-weight: 400;
              margin-bottom: 12mm;
            }
            .cover .meta {
              font-size: 10pt;
              color: #888;
              margin-top: 8mm;
            }
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
            .card .label {
              font-size: 9pt;
              font-weight: 600;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              color: #7c3aed;
              margin-bottom: 3mm;
            }
            .card .q {
              font-size: 11pt;
              font-weight: 600;
              line-height: 1.45;
              color: #1a1a1a;
              margin-bottom: 4mm;
            }
            .card .a {
              font-size: 10.5pt;
              line-height: 1.5;
              color: #444;
              border-top: 1px dashed #e0e0e0;
              padding-top: 4mm;
              margin-top: 4mm;
            }
            .footer {
              margin-top: 10mm;
              padding-top: 6mm;
              border-top: 1px solid #e0e0e0;
              font-size: 9pt;
              color: #888;
              text-align: center;
            }
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
            <div class="footer">
              Generated by LastMin Notes · lastminnotes.com
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

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
        {status === 'checking' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-foreground animate-spin" />
            <p className="text-muted-foreground">Loading your flashcards…</p>
          </div>
        )}

        {status === 'polling' && (
          <Card className="max-w-sm text-center">
            <CardContent className="pt-6 pb-6">
              <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto mb-4" />
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-muted-foreground mt-1">Generating your flashcards…</p>
              <p className="text-xs text-muted-foreground mt-2">AI is creating your deck. This may take 20–30 seconds.</p>
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
                <Link href="/">Create new flashcards</Link>
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
                  This link may expire. Use the download button above to save your flashcards as PDF before you close this page.
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
