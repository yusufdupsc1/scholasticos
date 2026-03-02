# Dhadash - Supabase + Vercel + CI/CD Guide

## Part 1: Supabase Database Setup

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Sign up with GitHub
3. Click "New Project"
4. Fill in details:
   - **Name**: `dhadash`
   - **Database Password**: `YourSecurePassword123!` (save this!)
   - **Region**: `Asia (Singapore)` - closest to Bangladesh

### Step 2: Get Connection Strings

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy these URLs:

```env
# Pooled URL (for DATABASE_URL) - uses port 6543
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:6543/postgres

# Direct URL (for DIRECT_URL) - uses port 5432
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

---

## Part 2: Vercel Setup

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Framework Preset: **Next.js**
5. Click "Deploy"

### Step 2: Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
# ============================================
# REQUIRED
# ============================================

# Database - Supabase (use pooled URL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxx.supabase.co:6543/postgres"

# Database - Supabase (use direct URL)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxx.supabase.co:5432/postgres"

# Auth Secret - Generate with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here-min-32-characters"

# URLs
AUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# App Config
GOVT_PRIMARY_MODE="true"
NEXT_PUBLIC_GOVT_PRIMARY_MODE="true"
NODE_ENV="production"
```

### Step 3: Get API Keys

After deploy, go to Supabase Dashboard → **Settings** → **API**:

- Copy **Project URL** → Save it
- Copy **service_role secret** → Save it (for admin tasks)

---

## Part 3: GitHub Actions CI/CD Setup

### Step 1: Create GitHub Workflow

Create file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: TypeScript Check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint || true

      - name: Deploy to Vercel (Production)
        if: github.ref == 'refs/heads/main'
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy Preview (Pull Requests)
        if: github.event_name == 'pull_request'
        run: |
          npm i -g vercel
          vercel --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Step 2: Get Vercel Tokens

1. **VERCEL_TOKEN**:
   - Go to https://vercel.com/account/tokens
   - Create new token → Copy it

2. **VERCEL_ORG_ID** & **VERCEL_PROJECT_ID**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel link`
   - It will create `.vercel/project.json` with these IDs

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name       | Value         |
| ----------------- | ------------- |
| VERCEL_TOKEN      | (from Step 2) |
| VERCEL_ORG_ID     | (from Step 2) |
| VERCEL_PROJECT_ID | (from Step 2) |

---

## Part 4: Database Migration Pipeline

### Option A: Auto-Migrate on Deploy

Update `.github/workflows/deploy.yml`:

```yaml
# Add after "Generate Prisma Client" step:
- name: Run Database Migration
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

### Option B: Manual Migration (Recommended)

1. Pull env from Vercel:

```bash
vercel env pull .env.local
```

2. Run migration locally:

```bash
npx prisma migrate deploy
```

3. Or use Supabase CLI:

```bash
npx supabase db push
```

---

## Part 5: Complete Setup Checklist

### GitHub Repository

- [ ] Push code to GitHub
- [ ] Add `.github/workflows/deploy.yml`
- [ ] Add Vercel secrets in GitHub Settings

### Vercel

- [ ] Import project from GitHub
- [ ] Add DATABASE_URL (pooled)
- [ ] Add DIRECT_URL (direct)
- [ ] Add AUTH_SECRET
- [ ] Add other required variables

### Supabase

- [ ] Create project
- [ ] Run initial migration
- [ ] (Optional) Seed data

---

## Part 6: Quick Commands

```bash
# Setup locally
git clone your-repo
cd your-repo
npm install

# Get Vercel env
vercel link
vercel env pull .env.local

# Database
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# Deploy
git add .
git commit -m "fix: bug fix"
git push origin main
# → Auto-deploys to Vercel!
```

---

## Troubleshooting

| Problem                   | Solution                                         |
| ------------------------- | ------------------------------------------------ |
| CI/CD fails on migration  | Use `prisma db push` instead of `migrate deploy` |
| Database connection error | Check Supabase connection string                 |
| Build fails               | Check Node.js version in workflow (use 20)       |
| Auth errors               | Regenerate AUTH_SECRET                           |

---

## Summary

1. **Supabase** → Database (postgresql)
2. **Vercel** → Hosting (Next.js)
3. **GitHub Actions** → CI/CD (auto-deploy on push)

Now whenever you push to GitHub main branch, it will automatically deploy to Vercel!
