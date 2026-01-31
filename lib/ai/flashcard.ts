import OpenAI from 'openai';
import type { Flashcard } from '@/types/flashcard';

/**
 * Flashcard Transformation Layer (Step 2 of the pipeline)
 * Token limits tuned to keep cost under RM1 per generation (gpt-4o-mini).
 *
 * Add OPENAI_API_KEY=sk-... in .env.local
 */
const SYSTEM_PROMPT = `You are an expert flashcard generator for last-minute exam revision. Your flashcards help students memorize and recall information quickly under exam pressure.

RULES:
1. One concept per flashcard. Never combine multiple concepts.
2. Question format: Use recall-oriented prompts — "What is X?", "Define Y", "How does Z work?", "What is the difference between A and B?", "What are the steps in...?"
3. Answer format: Concise, keyword-focused. 1–3 sentences or 2–4 bullet points max. Preserve exact definitions and technical terms.
4. Prioritize high-yield content: definitions, processes, comparisons, and concepts that commonly appear in exams.
5. Avoid vague questions. Each question must have one clear, testable answer.
6. Output valid JSON only. No markdown, no code blocks, no extra text.

FORMAT (strict): [{"question": "...", "answer": "..."}, ...]

QUALITY: Generate 8–25 flashcards depending on summary length. Every card must be useful for exam recall.`;

export async function generateFlashcards(summary: string): Promise<Flashcard[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured. Add it in .env.local');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Convert this exam summary into flashcards. Output a JSON array of {question, answer} objects only.\n\n${summary.slice(0, 5000)}`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.35,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty flashcard response');

  let jsonStr = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();

  const parsed = JSON.parse(jsonStr) as Array<{ question: string; answer: string }>;
  if (!Array.isArray(parsed)) throw new Error('Invalid flashcard format');

  return parsed.map((item, i) => ({
    id: `card-${i}-${Date.now()}`,
    question: String(item.question || '').trim(),
    answer: String(item.answer || '').trim(),
  })).filter((c) => c.question && c.answer);
}
