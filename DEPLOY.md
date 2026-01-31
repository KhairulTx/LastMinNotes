# Deploy LastMin Notes to GitHub + Vercel

Follow these steps to push your code to GitHub and deploy on Vercel with **secure API keys** (never in the repo).

---

## 1. Security first: never commit secrets

- **`.env.local`** is already in `.gitignore` — it will **not** be pushed to GitHub.
- **Do not** put real API keys in `.env.example` or any file you commit.
- Use **Vercel Environment Variables** for production; they are encrypted and not in the repo.

---

## 2. Push to GitHub

### If you don’t have a repo yet

1. **Create a new repo on GitHub**  
   - Go to [github.com/new](https://github.com/new)  
   - Name it e.g. `lastmin-notes`  
   - Do **not** add a README, .gitignore, or license (you already have them locally)

2. **In your project folder**, run:

```bash
cd "C:\Users\syahm\Desktop\SIDE PROJECT\LastMin Notes\LastMInNote"

# If Git isn't initialized yet
git init

# Add all files ( .env.local is ignored by .gitignore )
git add .
git commit -m "Initial commit: LastMin Notes"

# Replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### If you already have a repo

```bash
cd "C:\Users\syahm\Desktop\SIDE PROJECT\LastMin Notes\LastMInNote"
git add .
git commit -m "Prepare for deploy: session KV, env docs"
git push origin main
```

---

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub if you can).
2. **Add New Project** → **Import** your GitHub repo (`lastmin-notes` or whatever you named it).
3. Leave **Framework Preset** as Next.js and **Root Directory** as `.` → **Deploy**.
4. Wait for the first deploy (it may fail until env vars are set; that’s OK).

---

## 4. Set environment variables (required for full functionality)

In Vercel: **Project → Settings → Environment Variables**. Add these for **Production** (and optionally Preview):

| Variable | Required | Example / note |
|----------|----------|----------------|
| `OPENAI_API_KEY` | Yes (for AI) | `sk-...` from OpenAI |
| `TOYYIBPAY_USER_SECRET_KEY` | Yes (for payments) | From ToyyibPay dashboard |
| `TOYYIBPAY_CATEGORY_CODE` | Yes (for payments) | From ToyyibPay → Category |
| `APP_URL` | Yes (for payments) | `https://your-app.vercel.app` (your Vercel URL) |
| `TOKEN_SECRET` | Yes (for JWT) | Long random string, e.g. `openssl rand -base64 32` |
| `UPSTASH_REDIS_REST_URL` | Yes (after payment) | From Vercel Storage → Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (after payment) | From Vercel Storage → Upstash Redis |

Optional:

- `TOYYIBPAY_SANDBOX=1` — use ToyyibPay sandbox.
- `SKIP_PAYMENT_FOR_TEST=1` — **do not use in production**; only for local/test.

After adding/editing variables, **redeploy**: Deployments → … on latest deploy → **Redeploy**.

---

## 5. ToyyibPay callback URL (production)

In ToyyibPay dashboard, set your **callback / return URL** to:

- Return URL: `https://your-app.vercel.app/unlock?session={order_id}` (or whatever your bill API sends).
- Ensure the bill is created with `returnUrl` and `callbackUrl` pointing to your **Vercel domain** (`APP_URL`).

---

## 6. Quick checklist

- [ ] `.env.local` is **not** committed (it’s in `.gitignore`).
- [ ] Repo is pushed to GitHub.
- [ ] Project imported and deployed on Vercel.
- [ ] All env vars above set in Vercel (no secrets in repo).
- [ ] `APP_URL` = your Vercel app URL.
- [ ] Redeploy after changing env vars.
- [ ] Test: paste notes → pay RM1 → land on unlock and see flashcards (no “Session expired”).

You’re done. All functionality stays secure: API keys and secrets only in `.env.local` (local) and Vercel Environment Variables (production).
