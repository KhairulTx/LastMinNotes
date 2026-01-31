/**
 * Apify client for file text extraction.
 *
 * Set in .env.local:
 *   APIFY_API_TOKEN=apify_api_...
 *
 * You can use a document extraction Actor (e.g. "apify/document-parser")
 * or a custom Actor. This module calls the Apify API to run the Actor
 * and returns extracted text. For MVP, we support paste-only and mock
 * file extraction; replace runDocumentExtractor with real Actor run when ready.
 */

const APIFY_BASE = 'https://api.apify.com/v2';

export async function runDocumentExtractor(
  fileUrl: string,
  options?: { mimeType?: string }
): Promise<string> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    // Fallback: if no Apify token, return placeholder (use paste for MVP)
    console.warn('APIFY_API_TOKEN not set; file extraction disabled');
    return '[File extraction requires APIFY_API_TOKEN. Use paste for now.]';
  }

  // Example: run a document parser Actor and get text from dataset
  // Replace ACTOR_ID with your actual Apify Actor ID for PDF/DOCX
  const ACTOR_ID = process.env.APIFY_DOCUMENT_ACTOR_ID || 'apify/document-parser';
  const runRes = await fetch(`${APIFY_BASE}/acts/${ACTOR_ID}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      documentUrl: fileUrl,
      ...options,
    }),
  });

  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Apify run failed: ${runRes.status} ${err}`);
  }

  const runPayload = (await runRes.json()) as { data: { id: string } };
  const runId = runPayload.data.id;

  // Poll for completion and get dataset items (simplified; use Apify client SDK for production)
  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statusData = (await statusRes.json()) as { data: { status: string } };
    if (statusData.data.status === 'SUCCEEDED') break;
    if (statusData.data.status === 'FAILED') throw new Error('Apify run failed');
    attempts++;
  }

  const datasetRes = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}/dataset/items`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const items = (await datasetRes.json()) as Array<{ text?: string }>;
  const text = items.map((i) => i.text || '').join('\n\n').trim();
  return text || '[No text extracted from document.]';
}

/**
 * Normalize and clean raw text (remove extra newlines, trim).
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
