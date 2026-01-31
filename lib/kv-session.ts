/**
 * Shared session storage via Upstash Redis.
 * Use this so pending notes, payment verified, and flashcards persist across
 * serverless instances (fixes "Session expired" after payment on Vercel).
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local (from
 * Vercel Storage → Upstash Redis). If not set, all getters return null and setters no-op.
 */

import type { Flashcard } from '@/types/flashcard';

const PENDING_TTL_SEC = 30 * 60; // 30 min
const SESSION_TTL_SEC = 24 * 60 * 60; // 24 h
const PAYMENT_VERIFIED_TTL_SEC = 60 * 60; // 1 h (generation window after payment)

type RedisLike = { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts?: { ex: number }) => Promise<unknown> };
let redisClient: RedisLike | null | undefined;

async function getRedis(): Promise<RedisLike | null> {
  if (redisClient !== undefined) return redisClient ?? null;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }
  try {
    const { Redis } = await import('@upstash/redis');
    const client = new Redis({ url, token });
    redisClient = client as RedisLike;
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

const prefix = (s: string) => `lastmin:${s}`;

export async function getPendingNotesKV(sessionId: string): Promise<string | null> {
  const client = await getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(prefix(`pending:${sessionId}`));
    if (!raw) return null;
    const data = JSON.parse(raw) as { notes: string; createdAt: number };
    if (Date.now() - data.createdAt > PENDING_TTL_SEC * 1000) return null;
    return data.notes ?? null;
  } catch {
    return null;
  }
}

export async function setPendingNotesKV(sessionId: string, notes: string): Promise<void> {
  const client = await getRedis();
  if (!client) return;
  try {
    await client.set(prefix(`pending:${sessionId}`), JSON.stringify({ notes, createdAt: Date.now() }), { ex: PENDING_TTL_SEC });
  } catch (e) {
    console.error('Redis setPendingNotes error:', e);
  }
}

export async function isPaymentVerifiedKV(sessionId: string): Promise<boolean> {
  const client = await getRedis();
  if (!client) return false;
  try {
    const v = await client.get(prefix(`paid:${sessionId}`));
    return v === '1';
  } catch {
    return false;
  }
}

export async function setPaymentVerifiedKV(sessionId: string): Promise<void> {
  const client = await getRedis();
  if (!client) return;
  try {
    await client.set(prefix(`paid:${sessionId}`), '1', { ex: PAYMENT_VERIFIED_TTL_SEC });
  } catch (e) {
    console.error('Redis setPaymentVerified error:', e);
  }
}

export async function getSessionKV(sessionId: string): Promise<Flashcard[] | null> {
  const client = await getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(prefix(`session:${sessionId}`));
    if (!raw) return null;
    const data = JSON.parse(raw) as { flashcards: Flashcard[]; createdAt: number };
    if (Date.now() - data.createdAt > SESSION_TTL_SEC * 1000) return null;
    return Array.isArray(data.flashcards) && data.flashcards.length > 0 ? data.flashcards : null;
  } catch {
    return null;
  }
}

export async function setSessionKV(sessionId: string, flashcards: Flashcard[]): Promise<void> {
  const client = await getRedis();
  if (!client) return;
  try {
    await client.set(prefix(`session:${sessionId}`), JSON.stringify({ flashcards, createdAt: Date.now() }), { ex: SESSION_TTL_SEC });
  } catch (e) {
    console.error('Redis setSession error:', e);
  }
}
