---
name: publish-github-vercel
description: Use when the user asks to "publish", "deploy", "make live", "push", "go live", "host this", or "put it online". End-to-end GitHub + Vercel deployment.
---

# Publish to GitHub + Vercel

## Step 0: Gather Project Context (MANDATORY — run before anything else)

Run ALL of these commands in a single pass to understand the current state:

```bash
# === PROJECT STATE SNAPSHOT ===
echo "=== FRAMEWORK ==="
if [ -f package.json ]; then
  cat package.json | grep -E '"(name|version|next|vite|react)"' | head -10
elif [ -f pyproject.toml ]; then
  echo "Python project"
  head -5 pyproject.toml
else
  echo "Unknown framework"
fi

echo -e "\n=== GIT STATE ==="
if git rev-parse --is-inside-work-tree 2>/dev/null; then
  echo "Git: YES"
  echo "Branch: $(git branch --show-current)"
  echo "Remote: $(git remote -v 2>/dev/null | head -2)"
  echo "Uncommitted: $(git status --porcelain | wc -l | tr -d ' ') files"
  echo "Last commit: $(git log --oneline -1 2>/dev/null)"
else
  echo "Git: NO (not initialized)"
fi

echo -e "\n=== VERCEL STATE ==="
if [ -d .vercel ]; then
  echo "Vercel linked: YES"
  cat .vercel/project.json 2>/dev/null
else
  echo "Vercel linked: NO"
fi

echo -e "\n=== AUTH STATUS ==="
echo "GitHub: $(gh auth status 2>&1 | head -3)"
echo "Vercel: $(vercel whoami 2>&1)"

echo -e "\n=== STATIC ASSETS CHECK ==="
# Files in root that should be in public/
ROOT_ASSETS=$(find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.svg" -o -name "*.gif" -o -name "*.ico" -o -name "*.webp" -o -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" \) 2>/dev/null)
if [ -n "$ROOT_ASSETS" ]; then
  echo "WARNING: Static assets in root (should be in public/):"
  echo "$ROOT_ASSETS"
else
  echo "OK: No stray assets in root"
fi

echo -e "\n=== ENV VARS ==="
grep -rn 'import.meta.env\|process.env\|NEXT_PUBLIC_\|VITE_' --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . 2>/dev/null | grep -v node_modules | head -10
if [ $? -ne 0 ]; then echo "No env vars detected"; fi

echo -e "\n=== GITIGNORE ==="
if [ -f .gitignore ]; then
  for pattern in node_modules dist .vercel .env; do
    grep -q "$pattern" .gitignore && echo "OK: $pattern" || echo "MISSING: $pattern"
  done
else
  echo "WARNING: No .gitignore file"
fi
```

## Step 0b: Decide the Path

Based on the snapshot above, determine which scenario applies:

| Scenario | Git? | Remote? | Vercel? | Action |
|----------|------|---------|---------|--------|
| **Fresh project** | No | No | No | Full workflow (Steps 1-6) |
| **Local git, no remote** | Yes | No | No | Skip git init, do Steps 2-6 |
| **Has remote, no Vercel** | Yes | Yes | No | Skip git setup, do Steps 2, 4-6 |
| **Already deployed (update)** | Yes | Yes | Yes | Jump to Quick Update |
| **Auth missing** | — | — | — | Fix auth first, then re-evaluate |

**Skip steps that don't apply.** Do NOT run the full checklist if the project is already deployed.

---

## Step 1: Fix Issues Found in Snapshot

Only act on problems detected in Step 0:

### If auth is missing
```bash
# GitHub
brew install gh  # if not installed
gh auth login --web --git-protocol https

# Vercel
npm i -g vercel  # if not installed
vercel login
```

### If static assets are in root (Vite/Next.js projects)
```bash
mkdir -p public
find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.svg" -o -name "*.gif" -o -name "*.ico" -o -name "*.webp" -o -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" \) -exec cp {} public/ \;
```

Verify image references point to files that exist in `public/`:
```bash
grep -rn 'src="/' --include="*.tsx" --include="*.jsx" --include="*.html" . | grep -v node_modules
```

### If .gitignore is missing entries
Add the missing patterns:
```
node_modules/
dist/
.vercel/
.env
.env.local
.env.*.local
```

### If env vars are detected
Note them — they'll need to be set in Vercel after deploy.

---

## Step 2: Build Test

```bash
npm run build 2>&1
```

If it fails, fix errors before proceeding. Common issues:
- TypeScript errors → fix types or `// @ts-ignore` for non-critical
- Missing dependencies → `npm install <package>`
- Import errors → check file paths and case sensitivity

---

## Step 3: Create GitHub Repository

**Skip if remote already exists** (detected in Step 0).

```bash
# If no git repo
git init && git add -A && git commit -m "Initial commit"

# Create repo (use project folder name, lowercase-hyphens)
gh repo create PROJECT_NAME --public --source=. --push --description "PROJECT_DESCRIPTION"
```

If `origin` already exists (cloned project):
```bash
gh repo create PROJECT_NAME --public --description "PROJECT_DESCRIPTION"
git remote set-url origin https://github.com/USERNAME/PROJECT_NAME.git
git push -u origin main
```

---

## Step 4: Commit and Push

**Skip if no uncommitted changes** (detected in Step 0).

```bash
git add -A
git status  # Review what's being committed
git commit -m "feat: descriptive message"
git push origin main
```

---

## Step 5: Deploy to Vercel

```bash
vercel --yes --prod 2>&1
```

### If env vars were detected (Step 0)
Set them using Vercel MCP (preferred) or CLI:
```bash
echo -n 'VALUE' | vercel env add VAR_NAME production
```
Then redeploy: `vercel --prod 2>&1`

---

## Step 6: Verify and Report

Check deployment status:
```bash
vercel ls --limit 1
```

Report to user:
```
Website Published!

| Detail            | Value                                          |
|-------------------|-------------------------------------------------|
| Live URL          | https://PROJECT_NAME.vercel.app                |
| GitHub Repository | https://github.com/USERNAME/PROJECT_NAME       |
| Framework         | [detected]                                      |
| Auto-Deploy       | Enabled (pushes to main auto-deploy)           |
```

---

## Quick Update (already deployed)

For projects already on Vercel + GitHub:

```bash
git add -A
git commit -m "fix: describe what changed"
git push origin main
```

Vercel auto-redeploys in ~15 seconds. Verify:
```bash
vercel ls --limit 1
```

---

## Error Reference

| Error | Fix |
|-------|-----|
| `Unable to add remote "origin"` | `git remote set-url origin NEW_URL` |
| Broken images on Vercel | Move static assets to `public/` |
| Build fails on Vercel | Run `npm run build` locally first |
| 404 on page refresh (SPA) | Add `vercel.json`: `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` |
| Env vars not available | Set via `vercel env add` or Vercel MCP |
| `BUILDING` stuck | Wait 5 min, then check Vercel dashboard |

### Framework-Specific

**Vite:** Static assets MUST be in `public/`. Set `base: '/'` in vite.config.

**Next.js:** API routes work as serverless automatically. Use `NEXT_PUBLIC_` prefix for client env vars.
