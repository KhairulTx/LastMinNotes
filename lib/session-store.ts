import type { Flashcard } from '@/types/flashcard';

/**
 * In-memory session store. For production at scale, use Vercel KV or similar.
 */
const store = new Map<string, { flashcards: Flashcard[]; createdAt: number }>();
const tokenBySession = new Map<string, { token: string; createdAt: number }>();
const pendingNotesStore = new Map<string, { notes: string; createdAt: number }>();
const paymentVerifiedStore = new Set<string>();
const generatingSessions = new Set<string>();
const TTL_MS = 24 * 60 * 60 * 1000;
const PENDING_NOTES_TTL_MS = 30 * 60 * 1000; // 30 min
const TOKEN_CLAIM_MS = 10 * 60 * 1000;

export function setSession(sessionId: string, flashcards: Flashcard[]): void {
  store.set(sessionId, { flashcards, createdAt: Date.now() });
}

export function getSession(sessionId: string): Flashcard[] | null {
  const entry = store.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(sessionId);
    return null;
  }
  return entry.flashcards;
}

export function deleteSession(sessionId: string): void {
  store.delete(sessionId);
}

/** Store notes before payment (pay-first flow). */
export function setPendingNotes(sessionId: string, notes: string): void {
  pendingNotesStore.set(sessionId, { notes, createdAt: Date.now() });
}

export function getPendingNotes(sessionId: string): string | null {
  const entry = pendingNotesStore.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > PENDING_NOTES_TTL_MS) {
    pendingNotesStore.delete(sessionId);
    return null;
  }
  return entry.notes;
}

export function clearPendingNotes(sessionId: string): void {
  pendingNotesStore.delete(sessionId);
}

/** Mark payment as verified (callback). */
export function setPaymentVerified(sessionId: string): void {
  paymentVerifiedStore.add(sessionId);
}

export function isPaymentVerified(sessionId: string): boolean {
  return paymentVerifiedStore.has(sessionId);
}

/** Prevent concurrent AI generation for same session. */
export function setGenerating(sessionId: string): void {
  generatingSessions.add(sessionId);
}

export function clearGenerating(sessionId: string): void {
  generatingSessions.delete(sessionId);
}

export function isGenerating(sessionId: string): boolean {
  return generatingSessions.has(sessionId);
}

export function setPaymentToken(sessionId: string, token: string): void {
  tokenBySession.set(sessionId, { token, createdAt: Date.now() });
}

export function claimPaymentToken(sessionId: string): string | null {
  const entry = tokenBySession.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TOKEN_CLAIM_MS) {
    tokenBySession.delete(sessionId);
    return null;
  }
  tokenBySession.delete(sessionId);
  return entry.token;
}
