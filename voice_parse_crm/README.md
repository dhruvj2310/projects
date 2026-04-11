# FieldIntel — Voice to CRM

## Project Structure

```
fieldintel/
├── frontend/
│   ├── index.html   ← markup
│   ├── style.css    ← all styles
│   └── app.js       ← UI logic (calls /api/parse, no API key here)
├── api/
│   └── parse.js     ← Vercel serverless function (API key lives here)
├── vercel.json      ← routing config
└── .gitignore
```

## Deploy to Vercel (free)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create fieldintel --public   # or --private
git push -u origin main
```

### 2. Deploy on Vercel
- Go to vercel.com → New Project → Import your GitHub repo
- Vercel auto-detects the config from vercel.json

### 3. Add your API key (secret — never in code)
In the Vercel dashboard:
- Project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = `sk-ant-...your key...`
- Redeploy

Your live URL works publicly. The API key is only on Vercel's servers.
Anyone who copies your frontend gets broken code — `fetch('/api/parse')` only works on YOUR deployed domain.

## Local development
```bash
npm i -g vercel
vercel dev   # runs both frontend + api locally
```

Add a `.env.local` file (already in .gitignore):
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
