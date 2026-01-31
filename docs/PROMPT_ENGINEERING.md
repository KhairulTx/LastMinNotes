# OpenAI Prompt Engineering Guide

## Overview: Two-Step AI Pipeline

LastMin Notes uses a **two-step pipeline** to turn raw notes into exam-ready flashcards:

```
Raw Notes → Step 1: Summarize → Step 2: Flashcards → Preview → Pay → Unlock
```

| Step | File | Purpose |
|------|------|---------|
| 1 | `lib/ai/summarize.ts` | Remove filler, extract exam-relevant content, output bullet summary |
| 2 | `lib/ai/flashcard.ts` | Convert summary into Q&A flashcards (JSON) |

---

## Step 1: Summarization

**File:** `lib/ai/summarize.ts`

### Current System Prompt
```
You are an exam-focused summarizer for last-minute revision. Your job is to:
1. Remove filler, repetition, and non-exam content
2. Keep only: definitions, key concepts, functions/processes, comparisons, and exam keywords
3. Output a structured bullet-point summary that is concise and recall-friendly
4. Use short phrases and keywords, not long paragraphs
5. Preserve technical terms and exact definitions
Output only the bullet summary, no preamble.
```

### User Prompt
```
Summarize this study material for exam revision. Output only bullet points.

[user's notes - max 12,000 chars]
```

### Parameters
| Parameter | Value | Why |
|-----------|-------|-----|
| `model` | `gpt-4o-mini` | Fast, cheap, good for structured output |
| `max_tokens` | 2000 | Enough for long summaries |
| `temperature` | 0.3 | Low = more consistent, less creative |

### How to Customize
- **Add subject context:** e.g. "This is for a Biology exam. Focus on definitions and processes."
- **Stricter output:** "Use exactly bullet points. No numbered lists."
- **Language:** "Output in Bahasa Malaysia" or "Output in English only."

---

## Step 2: Flashcard Generation

**File:** `lib/ai/flashcard.ts`

### Current System Prompt
```
You are a flashcard generator for last-minute exam revision. Rules:
1. One concept per flashcard
2. Question on front, short keyword-focused answer on back
3. Questions should be clear and recall-oriented (e.g. "What is X?", "How does Y work?")
4. Answers must be concise: 1-3 sentences or bullet points max
5. Preserve exact definitions and key terms
6. Output valid JSON only, no markdown or extra text

Format: [{"question": "...", "answer": "..."}, ...]
```

### User Prompt
```
Convert this exam summary into flashcards. Output a JSON array of {question, answer} objects only.

[summary from Step 1 - max 6,000 chars]
```

### Parameters
| Parameter | Value | Why |
|-----------|-------|-----|
| `model` | `gpt-4o-mini` | Same as Step 1 |
| `max_tokens` | 3000 | Room for many flashcards |
| `temperature` | 0.4 | Slightly higher for variety in Q&A phrasing |

### How to Customize
- **Question styles:** "Use 'Define X' or 'Explain Y' format."
- **Answer length:** "Answers must be under 50 words."
- **Card count:** "Generate exactly 10 flashcards. No more, no less."

---

## Flow Diagram

```
User pastes/uploads notes
         ↓
  normalizeText() — clean whitespace
         ↓
  summarizeForExam() — OpenAI Step 1
         ↓
  generateFlashcards() — OpenAI Step 2
         ↓
  setSession() — store in memory
         ↓
  Return preview (first 3 cards)
```

---

## Quick Edits

### Change model (e.g. GPT-4 for better quality)
In both `summarize.ts` and `flashcard.ts`:
```ts
model: 'gpt-4o',  // or 'gpt-4-turbo'
```

### Add subject hint to summarization
In `summarize.ts`, user message:
```ts
content: `Summarize this study material for a [SUBJECT] exam. Focus on definitions and key processes. Output only bullet points.\n\n${truncated}`,
```

### Limit flashcard count
In `flashcard.ts`, system prompt add:
```
Generate between 5 and 15 flashcards. Prioritize the most important concepts.
```

---

## API Key Setup

1. Get key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Restart dev server: `npm run dev`
