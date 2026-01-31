# LastMin Notes

**Turn your notes into exam-ready flashcards in under 2 minutes.**  
Paste or upload your study material → AI summarizes and generates flashcards → Pay RM1 → Unlock, study, and download. No sign-up. Mobile-first. Feel free to use and adapt this project for your own learning tools or demos.

---

## What is this?

LastMin Notes is a **pay-per-use AI revision web app** for last-minute exam prep. It’s built for students who want to:

- Convert lecture notes, slides, or PDFs into **flashcards** quickly  
- Get **exam-focused** summaries (definitions, key concepts, processes)  
- Pay **RM1 per generation** via ToyyibPay — no subscription  
- Study on **mobile** (swipe, flip, export to PDF)

The app is **stateless**: no user accounts, no long-term database of your notes. Your content is processed for the session and you’re encouraged to download your flashcards before closing.

---

## Features

- **Paste or upload** — Raw text, PDF, or DOCX; text is extracted and cleaned  
- **AI pipeline** — Two steps: (1) exam-focused summarization, (2) flashcard generation (GPT-4o mini)  
- **Preview then pay** — See a few sample cards, then pay RM1 to unlock the full deck  
- **Flashcard viewer** — Swipe, tap-to-flip, mark done, progress indicator  
- **PDF export** — Download your deck as a clean, printable PDF  
- **Themes** — Light, dark, and a few colour themes  
- **Privacy** — No accounts; payment via ToyyibPay; session data in Redis/KV for post-payment redirect only  

---

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS  
- **Backend:** Next.js API Routes, Server Actions  
- **AI:** OpenAI (summarize + flashcard steps)  
- **Payment:** ToyyibPay (Malaysia)  
- **Session storage:** Upstash Redis / Vercel KV (so “Session expired” after payment is avoided)  
- **Hosting:** Vercel (or any Node-compatible host)

---

## Quick start

```bash
git clone https://github.com/KhairulTx/LastMinNotes.git
cd LastMinNotes
npm install
cp .env.example .env.local
```

Add your own API keys and config in **`.env.local`** (see [Environment variables](#environment-variables)). **Do not commit `.env.local` or any file containing real keys.**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

All secrets and API keys belong in **`.env.local`** (local) or your host’s **environment variables** (e.g. Vercel). Never commit real values.

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for summarization and flashcard generation |
| `TOYYIBPAY_USER_SECRET_KEY` | ToyyibPay user secret (from dashboard) |
| `TOYYIBPAY_CATEGORY_CODE` | ToyyibPay category code |
| `APP_URL` | Full app URL (e.g. `https://your-app.vercel.app`) for payment callback |
| `TOKEN_SECRET` | Secret for JWT access tokens (use a long random string in production) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (session after payment) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

See **`.env.example`** for a full list and short notes. Copy it to `.env.local` and replace placeholders with your own values.

---

## Project structure

```
app/
  page.tsx              # Landing
  generate/             # Input, preview, pay
  unlock/               # Full deck after payment
  api/                   # API routes (AI, payment callback, unlock, flashcards)
lib/
  ai/                    # Summarize + flashcard logic
  payments/              # ToyyibPay
  security/              # JWT access token
  kv-session.ts          # Redis/KV session (pending notes, payment verified, deck)
```

---

## Deploy (e.g. Vercel)

1. Push this repo to your own GitHub (or use [KhairulTx/LastMinNotes](https://github.com/KhairulTx/LastMinNotes)).  
2. Import the repo in Vercel (or similar).  
3. Set **all** required env vars in the host’s dashboard (no API keys in the repo).  
4. Deploy and set `APP_URL` to your live URL.  

Details: **[DEPLOY.md](DEPLOY.md)**.

---

## License and use

This project is shared for learning and reuse. Feel free to use, fork, and adapt it for your own projects or demos. Do not use it to generate or distribute exam content that violates academic integrity. API keys and secrets are your responsibility; keep them in environment variables and never commit them.

---

## Author

**KhairulTx** — [GitHub](https://github.com/KhairulTx)
