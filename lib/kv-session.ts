/**
 * Shared session storage via Vercel KV (Redis).
 * Use this so pending notes, payment verified, and flashcards persist across
 * serverless instances (fixes "Session expired" after payment on Vercel).
 *
 * Set KV_REST_API_URL and KV_REST_API_TOKEN in .env.local (from Vercel KV or
 * Upstash Redis integration). If not set, all getters return null and setters no-op.
 */

import type { Flashcard } from '@/types/flashcard';

const PENDING_TTL_SEC = 30 * 60; // 30 min
const SESSION_TTL_SEC = 24 * 60 * 60; // 24 h
const PAYMENT_VERIFIED_TTL_SEC = 60 * 60; // 1 h (generation window after payment)

let kvClient: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<void> } | null | undefined;

async function getKv(): Promise<{ get: (k: string) => Promise<unknown>; set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<void> } | null> {
  if (kvClient !== undefined) return kvClient;
  // Support both Vercel KV and Upstash Redis env var names
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    kvClient = null;
    return null;
  }
  try {
    const { createClient } = await import('@vercel/kv');
    kvClient = createClient({ url, token });
    return kvClient;
  } catch {
    kvClient = null;
    return null;
  }
}

const prefix = (s: string) => `lastmin:${s}`;

export async function getPendingNotesKV(sessionId: string): Promise<string | null> {
  const client = await getKv();
  if (!client) return null;
  try {
    const raw = await client.get(prefix(`pending:${sessionId}`));
    if (!raw || typeof raw !== 'object' || !('notes' in (raw as object))) return null;
    const { notes, createdAt } = raw as { notes: string; createdAt: number };
    if (Date.now() - createdAt > PENDING_TTL_SEC * 1000) return null;
    return notes ?? null;
  } catch {
    return null;
  }
}

export async function setPendingNotesKV(sessionId: string, notes: string): Promise<void> {
  const client = await getKv();
  if (!client) return;
  try {
    await client.set(prefix(`pending:${sessionId}`), { notes, createdAt: Date.now() }, { ex: PENDING_TTL_SEC });
  } catch (e) {
    console.error('KV setPendingNotes error:', e);
  }
}

export async function isPaymentVerifiedKV(sessionId: string): Promise<boolean> {
  const client = await getKv();
  if (!client) return false;
  try {
    const v = await client.get(prefix(`paid:${sessionId}`));
    return v === '1';
  } catch {
    return false;
  }
}

export async function setPaymentVerifiedKV(sessionId: string): Promise<void> {
  const client = await getKv();
  if (!client) return;
  try {
    await client.set(prefix(`paid:${sessionId}`), '1', { ex: PAYMENT_VERIFIED_TTL_SEC });
  } catch (e) {
    console.error('KV setPaymentVerified error:', e);
  }
}

export async function getSessionKV(sessionId: string): Promise<Flashcard[] | null> {
  const client = await getKv();
  if (!client) return null;
  try {
    const raw = await client.get(prefix(`session:${sessionId}`));
    if (!raw || typeof raw !== 'object' || !('flashcards' in (raw as object))) return null;
    const { flashcards, createdAt } = raw as { flashcards: Flashcard[]; createdAt: number };
    if (Date.now() - createdAt > SESSION_TTL_SEC * 1000) return null;
    return Array.isArray(flashcards) && flashcards.length > 0 ? flashcards : null;
  } catch {
    return null;
  }
}

export async function setSessionKV(sessionId: string, flashcards: Flashcard[]): Promise<void> {
  const client = await getKv();
  if (!client) return;
  try {
    await client.set(prefix(`session:${sessionId}`), { flashcards, createdAt: Date.now() }, { ex: SESSION_TTL_SEC });
  } catch (e) {
    console.error('KV setSession error:', e);
  }
}
