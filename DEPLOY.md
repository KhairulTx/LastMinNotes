# Deploy LastMin Notes to GitHub + Vercel

**Important:** If a build fails, do **not** click "Redeploy" on that failed deployment — that rebuilds the **same old commit**. To deploy the latest code: push to `main` and wait for the **new** deployment that Vercel creates automatically, or in Vercel go to **Deployments** → **Create Deployment** and select branch `main` (latest commit).

---

## Deploy on Vercel (quick steps — already pushed)

1. **Import repo**  
   Go to [vercel.com](https://vercel.com) → sign in (GitHub) → **Add New** → **Project** → **Import** the repo **KhairulTx/LastMinNotes**.

2. **Deploy**  
   Leave **Framework Preset** as Next.js, **Root Directory** as `.` → click **Deploy**. Wait for the first build (it may succeed but some features need env vars).

3. **Add environment variables**  
   In the project: **Settings** → **Environment Variables**. Add each variable below for **Production** (copy values from your `.env.local` — never paste them in the repo):

   | Name | Value (from your .env.local) |
   |------|-----------------------------|
   | `OPENAI_API_KEY` | Your OpenAI key |
   | `TOYYIBPAY_USER_SECRET_KEY` | Your ToyyibPay secret key |
   | `TOYYIBPAY_CATEGORY_CODE` | Your ToyyibPay category code |
   | `APP_URL` | **Your Vercel URL** (e.g. `https://lastminnotes.vercel.app`) |
   | `TOKEN_SECRET` | Long random string (e.g. 32+ chars) |
   | `UPSTASH_REDIS_REST_URL` | Your Upstash Redis URL |
   | `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token |

   **Session storage (Redis) is required** so your session survives the payment redirect. Without it you get "Session storage is not set up" before payment and "Session expired" after payment. Two options:
   - **Vercel KV:** Project → **Storage** → **Create Database** → choose **KV** (Upstash) → **Connect** to this project and select **Production**.
   - **Manual:** Create a database at [upstash.com](https://upstash.com), copy REST URL and token, add as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Environment Variables for **Production**.

4. **Redeploy**  
   **Deployments** → open the **⋯** on the latest deployment → **Redeploy**. This applies the new env vars.

5. **ToyyibPay (production)**  
   In ToyyibPay dashboard, make sure callback/return URLs use your **Vercel domain** (same as `APP_URL`).

Done. Your app will be live at the URL Vercel gives you (e.g. `https://lastminnotes.vercel.app`).

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
