'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, RotateCcw, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Flashcard } from '@/types/flashcard';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onExportPdf?: () => void;
}

export function FlashcardViewer({ flashcards, onExportPdf }: FlashcardViewerProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const card = flashcards[index];

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.max(0, Math.min(flashcards.length - 1, i + delta)));
    },
    [flashcards.length]
  );

  const toggleComplete = useCallback(() => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [index]);

  const shuffle = useCallback(() => {
    setFlipped(false);
    setIndex(Math.floor(Math.random() * flashcards.length));
  }, [flashcards.length]);

  if (!card) return null;

  const progress = ((index + 1) / flashcards.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full">
      {/* Top bar: back, progress, refresh, download */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="p-1.5 -ml-1.5 rounded hover:bg-muted transition-colors inline-flex"
          aria-label="Back"
        >
          <span className="text-xl">←</span>
        </Link>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Card {index + 1} of {flashcards.length}</p>
          <p className="text-xs text-muted-foreground">{completed.size} completed</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={shuffle} className="h-9 w-9" aria-label="Shuffle">
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onExportPdf && (
            <Button variant="ghost" size="icon" onClick={onExportPdf} className="h-9 w-9" aria-label="Download PDF">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card with 3D flip and hover */}
      <div
        className="flex-1 min-h-[260px] cursor-pointer perspective-1000"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className={cn(
            'flashcard-flip-inner relative w-full h-full min-h-[260px] rounded-xl border border-border bg-card shadow-md',
            'hover:scale-[1.02] hover:-translate-y-1'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-xl backface-hidden flex flex-col p-6 justify-center text-left border border-border bg-card"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Question
            </span>
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {card.question}
            </p>
          </div>
          {/* Back face */}
          <div
            className="absolute inset-0 rounded-xl flex flex-col p-6 justify-center text-left border border-border bg-muted/40"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Answer
            </span>
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {card.answer}
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-muted-foreground text-xs mt-3">Tap to flip</p>

      {/* Bottom: prev, Mark as done, next */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="h-10 w-10 shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant={completed.has(index) ? 'default' : 'secondary'}
          size="default"
          onClick={toggleComplete}
          className="gap-2 flex-1 max-w-[180px]"
        >
          <Check className="w-4 h-4" />
          Mark as done
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(1)}
          disabled={index === flashcards.length - 1}
          className="h-10 w-10 shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {flashcards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setFlipped(false); setIndex(i); }}
            className={cn(
              'rounded-full transition-all duration-200',
              i === index ? 'w-2.5 h-2.5 bg-foreground' : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
