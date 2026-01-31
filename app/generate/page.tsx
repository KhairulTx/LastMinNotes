'use client';

import { useState } from 'react';
import { FileText, Zap } from 'lucide-react';
import { initiatePayment, getSamplePreview } from './actions';
import { TextInput } from './components/TextInput';
import { FileUploader } from './components/FileUploader';
import { PreviewCards } from './components/PreviewCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Flashcard } from '@/types/flashcard';

type Step = 'input' | 'preview';

const PLACEHOLDER = `Paste your notes here... For example:
• Lecture notes from class
• Text from slides or PDFs
• Key concepts you need to memorize
• Any study material you want to convert to flashcards

The more detailed your notes, the better the flashcards!`;

export default function GeneratePage() {
  const [text, setText] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Flashcard[]>([]);
  const [total, setTotal] = useState(0);
  const [paying, setPaying] = useState(false);

  const handleContinueToPreview = async () => {
    const { preview: sample, total: sampleTotal } = await getSamplePreview();
    setPreview(sample);
    setTotal(sampleTotal);
    setStep('preview');
  };

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await initiatePayment(text, origin);
      if (!result.ok) {
        setError(result.error);
        setPaying(false);
        return;
      }
      window.location.href = result.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
      setPaying(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-xl">
          {step === 'input' ? (
            <div className="space-y-6">
              <Badge variant="secondary" className="font-normal text-muted-foreground gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Step 1 of 3
              </Badge>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Paste Your Notes</h1>
                <p className="text-muted-foreground text-sm">
                  Copy and paste your lecture notes, study material, or slides below. Or upload a file.
                </p>
              </div>

              <FileUploader
                onTextExtracted={(t) => { setText(t); setError(null); }}
                onError={setError}
              />

              <div>
                <TextInput
                  value={text}
                  onChange={(v) => { setText(v); setError(null); }}
                  placeholder={PLACEHOLDER}
                />
                <p className="text-right text-xs text-muted-foreground mt-1">
                  {text.length.toLocaleString()} / 50,000
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleContinueToPreview}
                disabled={text.trim().length < 50}
                className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium gap-2"
              >
                <Zap className="w-5 h-5" />
                Continue to Preview
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your notes are processed securely and not stored permanently.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <PreviewCards
                preview={preview}
                total={total}
                onPay={handlePay}
                paying={paying}
                onBack={() => { setStep('input'); setError(null); }}
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
