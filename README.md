# LastMin Notes

Exam-ready flashcards in minutes. Paste notes → AI summarizes → Pay RM1 → Unlock & study. No sign-up, mobile-first.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode (stakeholder first):** With no API keys, the app runs in demo mode. You can paste notes, see mock AI summarization → flashcards → preview → unlock full deck. Add API keys in `.env.local` for production.

## Prompt engineering

See **[docs/PROMPT_ENGINEERING.md](docs/PROMPT_ENGINEERING.md)** for:
- How the 2-step AI pipeline works (summarize → flashcards)
- Current prompts and how to customize them
- Model, temperature, and token settings

## Where to put the AI API key

1. Copy `.env.example` to `.env.local`.
2. Add your **OpenAI API key** in `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   ```
3. The app uses this key in two places:
   - **Summarization**: `lib/ai/summarize.ts` and API route `app/api/ai/summarize/route.ts`
   - **Flashcard generation**: `lib/ai/flashcard.ts` and API route `app/api/ai/flashcards/route.ts`

No other config is required to generate flashcards from pasted text. ToyyibPay keys are needed only for real RM1 payments.

## Features

- **Paste text** → AI summarizes and generates flashcards (GPT-4o mini).
- **Preview** first 3 cards, then **Pay RM1** (ToyyibPay) to unlock full deck.
- **Unlock page** shows full deck, tap to flip, export to PDF (print).
- No auth, no database, stateless.

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for AI) | OpenAI API key for summarize + flashcards |
| `TOYYIBPAY_USER_SECRET_KEY` | For payments | From toyyibPay dashboard |
| `TOYYIBPAY_CATEGORY_CODE` | For payments | From Create Category API |
| `APP_URL` | For payments | e.g. `https://your-app.vercel.app` |
| `TOKEN_SECRET` | Production | Secret for JWT (min 32 chars); set in Vercel |
| `UPSTASH_REDIS_REST_URL` | Production | Upstash Redis URL (session after payment) |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Upstash Redis token |
| `APIFY_API_TOKEN` | Optional | For PDF/DOCX file extraction |

**Never commit real keys.** Use `.env.local` locally and [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) in production.

## Project structure

- `app/page.tsx` — Landing
- `app/generate/page.tsx` — Input, preview, pay
- `app/unlock/page.tsx` — View deck after payment
- `app/api/ai/summarize/route.ts` — **AI summarize API** (uses `OPENAI_API_KEY`)
- `app/api/ai/flashcards/route.ts` — **AI flashcard API** (uses `OPENAI_API_KEY`)
- `lib/ai/summarize.ts` — Summarization logic
- `lib/ai/flashcard.ts` — Flashcard generation logic

## Deploy (GitHub + Vercel)

See **[DEPLOY.md](DEPLOY.md)** for step-by-step:

1. Push to GitHub (`.env.local` is ignored; never commit API keys).
2. Import repo in Vercel and deploy.
3. Set all env vars in Vercel (OpenAI, ToyyibPay, `APP_URL`, `TOKEN_SECRET`, Upstash Redis).
4. Redeploy after adding env vars. Test payment flow end-to-end.
