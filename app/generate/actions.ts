'use server';

import { SAMPLE_FLASHCARDS } from '@/lib/sample-flashcards';
import type { Flashcard } from '@/types/flashcard';

/** Sample cards for marketing preview (no AI cost). */
export async function getSamplePreview(): Promise<{ preview: Flashcard[]; total: number }> {
  return { preview: SAMPLE_FLASHCARDS, total: SAMPLE_FLASHCARDS.length };
}
