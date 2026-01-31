/**
 * Test mode only: persist pending notes and generated flashcards to disk
 * so unlock API and flashcards API can read them across different processes.
 * Only used when SKIP_PAYMENT_FOR_TEST=1.
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import type { Flashcard } from '@/types/flashcard';

const NOTES_DIR = path.join(process.cwd(), '.test-pending-notes');
const SESSION_DIR = path.join(process.cwd(), '.test-pending-notes');

export async function writeTestPendingNotes(sessionId: string, notes: string): Promise<void> {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  await mkdir(NOTES_DIR, { recursive: true });
  await writeFile(path.join(NOTES_DIR, `${safe}.txt`), notes, 'utf-8');
}

export async function readTestPendingNotes(sessionId: string): Promise<string | null> {
  try {
    const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const data = await readFile(path.join(NOTES_DIR, `${safe}.txt`), 'utf-8');
    return data ?? null;
  } catch {
    return null;
  }
}

/** Persist generated flashcards so /api/flashcards can read them in test mode (different process). */
export async function writeTestSession(sessionId: string, flashcards: Flashcard[]): Promise<void> {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  await mkdir(SESSION_DIR, { recursive: true });
  await writeFile(path.join(SESSION_DIR, `${safe}.json`), JSON.stringify(flashcards), 'utf-8');
}

export async function readTestSession(sessionId: string): Promise<Flashcard[] | null> {
  try {
    const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const data = await readFile(path.join(SESSION_DIR, `${safe}.json`), 'utf-8');
    const parsed = JSON.parse(data) as Flashcard[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}
