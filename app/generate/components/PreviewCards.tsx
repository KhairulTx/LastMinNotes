'use client';

import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Flashcard } from '@/types/flashcard';

interface PreviewCardsProps {
  preview: Flashcard[];
  total: number;
  onPay: () => void;
  paying?: boolean;
  onBack?: () => void;
}

export function PreviewCards({ preview, total, onPay, paying, onBack }: PreviewCardsProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 rounded hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <span className="text-xl">←</span>
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold text-foreground">See What You&apos;ll Get</h2>
          <p className="text-sm text-muted-foreground">Sample format • Your notes → personalized flashcards</p>
        </div>
      </div>

      {/* Sample cards - all visible as marketing preview */}
      <div className="space-y-4">
        {preview.map((card) => (
          <Card key={card.id} className="overflow-hidden transition-shadow duration-200 hover:shadow-sm">
            <CardContent className="p-5 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Question</p>
              <p className="font-medium text-foreground">{card.question}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Answer</p>
              <p className="text-sm text-muted-foreground">{card.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment CTA */}
      <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">Pay once, get your deck</p>
          <p className="text-sm text-muted-foreground">AI generates flashcards from your notes after payment</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <span className="text-2xl font-bold text-foreground">RM1</span>
          <span className="text-xs text-muted-foreground">one-time + small payment fee</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Checkout may show ~RM2 (RM1 + payment gateway fee). We charge RM1; the rest is the provider&apos;s fee.
      </p>

      <Button
        onClick={onPay}
        disabled={paying}
        size="lg"
        variant="outline"
        className="w-full h-12 text-base font-semibold border-2 border-foreground bg-foreground hover:bg-foreground/90 text-background gap-2"
      >
        {paying ? (
          'Redirecting to payment…'
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Pay RM1 to Generate
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Secure payment via ToyyibPay • No account required • Total at checkout: ~RM2 (RM1 + gateway fee)
      </p>
    </div>
  );
}
