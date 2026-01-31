import * as jose from 'jose';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'dev-secret-change-in-production';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function createAccessToken(sessionId: string): Promise<string> {
  const secret = new TextEncoder().encode(TOKEN_SECRET);
  return new jose.SignJWT({ sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<{ sessionId: string } | null> {
  try {
    const secret = new TextEncoder().encode(TOKEN_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return { sessionId: payload.sessionId as string };
  } catch {
    return null;
  }
}
