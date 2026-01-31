# LastMin Notes

**Turn your notes into exam-ready flashcards in under 2 minutes.**  
Paste or upload your study material → AI summarizes → Pay RM1 → Unlock, study & download. No sign-up. Mobile-first. Built for last-minute revision.

---

## Free to Use

This project is **free to use**. Clone the repo, add your own API keys in `.env.local` (never committed), and run it locally or deploy to Vercel. No API keys or secrets are stored in this repository — you keep full control of your credentials.

---

## What It Does

- **Paste or upload** — Raw text, PDF, or DOCX. Notes are extracted and cleaned.
- **AI in two steps** — Summarization (exam-focused) then flashcard generation (one concept per card).
- **Preview then pay** — See 3 sample cards, then pay RM1 via ToyyibPay to unlock the full deck.
- **Study & export** — Swipe through cards, tap to flip, download as a clean PDF.

Built for **diploma and degree students** in study week or exam week: fast, affordable, no accounts.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **AI:** OpenAI (GPT-4o mini) — summarize + flashcard steps
- **Payment:** ToyyibPay (RM1 per generation)
- **Session:** Upstash Redis (so session survives after payment redirect on serverless)
- **Hosting:** Vercel (recommended)

---

## Quick Start

```bash
git clone https://github.com/KhairulTx/LastMinNotes.git
cd LastMinNotes
npm install
cp .env.example .env.local
```

Edit **`.env.local`** and add your own keys (OpenAI, ToyyibPay, etc.). See `.env.example` for variable names — **never put real keys in any file you commit.**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

All secrets stay in **`.env.local`** (gitignored). Use **`.env.example`** as a template:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | AI summarization and flashcard generation |
| `TOYYIBPAY_USER_SECRET_KEY` | Payment gateway (RM1) |
| `TOYYIBPAY_CATEGORY_CODE` | ToyyibPay category |
| `APP_URL` | Your app URL (e.g. `https://your-app.vercel.app`) |
| `TOKEN_SECRET` | JWT signing (use a long random string in production) |
| `UPSTASH_REDIS_REST_URL` | Session store (production) |
| `UPSTASH_REDIS_REST_TOKEN` | Session store (production) |

**Security:** This repo does **not** contain any API keys. Never commit `.env.local` or paste real keys in issues/PRs.

---

## Project Structure

| Path | Description |
|------|-------------|
| `app/page.tsx` | Landing page |
| `app/generate/` | Input, preview, pay flow |
| `app/unlock/` | Full deck after payment |
| `app/api/ai/` | Summarize & flashcard API routes |
| `app/api/toyyibpay/` | Create bill & payment callback |
| `app/api/unlock/` | Post-payment unlock & generation |
| `lib/ai/` | Summarization and flashcard logic |
| `lib/kv-session.ts` | Shared session store (Redis) |
| `lib/payments/toyyibpay.ts` | ToyyibPay integration |

---

## Deploy (Vercel)

1. Push this repo to your own GitHub (or use this one).
2. In [Vercel](https://vercel.com), import the repo and deploy.
3. In **Project → Settings → Environment Variables**, add the same variables as in `.env.example` with your **own** values.
4. Redeploy. Set `APP_URL` to your Vercel URL.

See **[DEPLOY.md](DEPLOY.md)** for the full checklist.

---

## License

Free to use. Clone, modify, and deploy with your own API keys. No API keys or secrets are included in this repository.

---

**LastMin Notes** — Exam-ready flashcards in minutes.  
© 2026 KhairulTX
