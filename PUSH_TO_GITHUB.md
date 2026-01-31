# Push to GitHub — run these steps

Your repo is ready: **git is initialized**, **initial commit is done**, and **`.env.local` is not in the commit** (secrets are safe).

## 1. Create a new repo on GitHub

1. Open **https://github.com/new**
2. **Repository name:** e.g. `lastmin-notes`
3. Leave it **empty** (no README, no .gitignore — you already have them)
4. Click **Create repository**

## 2. Push from your project folder

In **PowerShell** or **Command Prompt**, run (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

```powershell
cd "C:\Users\syahm\Desktop\SIDE PROJECT\LastMin Notes\LastMInNote"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Example: if your username is `KhairulTX` and repo is `lastmin-notes`:

```powershell
git remote add origin https://github.com/KhairulTX/lastmin-notes.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Go to **https://vercel.com** → **Add New** → **Project**
2. **Import** the GitHub repo you just pushed
3. Deploy (defaults are fine)
4. In **Settings → Environment Variables**, add all keys from `.env.example` (use your real values from `.env.local`; never paste them here or in Git)
5. **Redeploy** after adding env vars

Done. See **DEPLOY.md** for the full checklist.
