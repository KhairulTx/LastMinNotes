# Push to GitHub — one step left

Your repo is ready: **git is initialized**, **commits are done**, and **`.env.local` is gitignored** (your API keys are not in the repo).

## Remote is set

- **Repository:** https://github.com/KhairulTx/LastMinNotes  
- Remote `origin` already points to: `https://github.com/KhairulTx/LastMinNotes.git`

## What you do: push (GitHub will ask for your login)

1. **Create the repo on GitHub** (if you haven’t yet):  
   https://github.com/new → name: **LastMinNotes** → Create repository (leave it empty).

2. **Push from your project folder** (PowerShell or Command Prompt):

```powershell
cd "C:\Users\syahm\Desktop\SIDE PROJECT\LastMin Notes\LastMInNote"
git push -u origin main
```

When prompted, sign in to GitHub (browser or token). After a successful push, your code is on https://github.com/KhairulTx/LastMinNotes.

## Deploy on Vercel

1. Go to **https://vercel.com** → **Add New** → **Project**
2. **Import** the repo **KhairulTx/LastMinNotes**
3. Deploy (defaults are fine)
4. In **Settings → Environment Variables**, add the variables from `.env.example` using your **own** values from `.env.local` (never paste real keys in the repo)
5. **Redeploy** after adding env vars

See **DEPLOY.md** for the full checklist.
