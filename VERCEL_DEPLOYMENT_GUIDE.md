# Dhadash Vercel Deployment Guide

## Quick Summary

### Required Variables (Must Set)

```env
# Database - Use Vercel Postgres or Neon
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
AUTH_SECRET="generate-a-strong-random-string"
AUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# App Config
GOVT_PRIMARY_MODE="true"
NEXT_PUBLIC_GOVT_PRIMARY_MODE="true"
NODE_ENV="production"
```

### Optional Variables (Skip for now)

```env
# Payment (Optional - for Bangladesh)
SSLCOMMERZ_STORE_ID=""
SSLCOMMERZ_STORE_PASSWORD=""

# Email (Optional)
RESEND_API_KEY=""

# OAuth (Optional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

---

## Step-by-Step Setup for Vercel

### 1. Database (Required)

**Option A: Vercel Postgres** (Recommended)

```bash
# In Vercel Dashboard:
# Project → Storage → Create Database → Postgres
# Copy the connection string
```

**Option B: Neon** (Free tier)

```bash
# Go to https://neon.tech
# Create project → Copy connection string
# Use pooled URL for DATABASE_URL, direct URL for DIRECT_URL
```

### 2. Generate AUTH_SECRET

```bash
# Run this command:
openssl rand -base64 32

# Or use: https://generate-secret.vercel.app/32
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
# ... add other variables
```

### 4. Database Migration

After first deploy, run Prisma migration:

```bash
# In Vercel Dashboard:
# Project → Functions → Select function → Run npm run prisma:migrate
# Or use Vercel CLI:
vercel env pull
npx prisma migrate deploy
```

---

## Complete .env for Vercel

Create this in Vercel Project Settings → Environment Variables:

```env
# ============================================
# REQUIRED VARIABLES
# ============================================

# Database (Vercel Postgres or Neon)
DATABASE_URL="postgresql://user:password@host:5432/db"
DIRECT_URL="postgresql://user:password@host:5432/db"

# Auth (Generate with: openssl rand -base64 32)
AUTH_SECRET="your-generated-secret-key-min-32-chars"
AUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# App Mode
GOVT_PRIMARY_MODE="true"
NEXT_PUBLIC_GOVT_PRIMARY_MODE="true"
NODE_ENV="production"

# ============================================
# OPTIONAL - PAYMENTS (Bangladesh)
# ============================================

# SSLCommerz (Bangladesh Payment Gateway)
# Get from: https://merchant.sslcommerz.com
SSLCOMMERZ_STORE_ID=""
SSLCOMMERZ_STORE_PASSWORD=""
SSLCOMMERZ_SANDBOX="true"

# ============================================
# OPTIONAL - EMAIL
# ============================================

# Resend (Free tier: 3,000 emails/month)
# Get from: https://resend.com
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# ============================================
# OPTIONAL - OAUTH
# ============================================

# Google OAuth (for Google Login)
# Get from: https://console.cloud.google.com
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# ============================================
# OPTIONAL - OTHER SERVICES
# ============================================

# Stripe (International payments)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# UploadThing (File uploads)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Twilio (SMS/OTP)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_VERIFY_SERVICE_SID=""
```

---

## Vercel Deployment Commands

```bash
# 1. Install dependencies
npm install

# 2. Pull environment from Vercel
vercel env pull .env.local

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Seed database (optional)
npx tsx prisma/seed.ts
```

---

## Troubleshooting

| Issue                     | Solution                                |
| ------------------------- | --------------------------------------- |
| Build fails               | Run `npx prisma generate` locally first |
| Database connection error | Check DATABASE_URL is correct           |
| Auth errors               | Regenerate AUTH_SECRET                  |
| Static assets 404         | Rebuild in Vercel Dashboard             |

---

## Quick Start (Minimal Config)

For testing, just set these 7 variables:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="any-32-character-random-string"
AUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
GOVT_PRIMARY_MODE="true"
NEXT_PUBLIC_GOVT_PRIMARY_MODE="true"
```

The app will work without optional variables (payment, email, OAuth).
