# XPRealm

Your personal remote job exploration realm — a PWA that aggregates remote/freelance/part-time opportunities from job APIs, web scraping, and Reddit, with AI-powered matching and comment generation.

## Tech Stack

- **Next.js 16** (App Router, TypeScript strict)
- **Tailwind CSS v4** + **shadcn/ui** (dark editorial theme, electric mint accent)
- **Prisma 5** + **Neon** (PostgreSQL serverless)
- **NextAuth v5** (Credentials + Reddit OAuth)
- **Cloudflare R2** (resume storage)
- **Anthropic Claude** (`claude-haiku-4-5-20251001`)
- **web-push** (PWA push notifications)
- **snoowrap** (Reddit API)
- **Vercel Cron** (daily Reddit fetch at 9AM)

## Setup

### 1. Install dependencies

```bash
npm install
npx playwright install chromium   # only needed for dynamic scraping
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`.

**Required for core functionality:**
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `DATABASE_URL` — Neon PostgreSQL connection string

**Required per feature:**
- Reddit OAuth: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`
- Reddit Cron (app-level): `REDDIT_APP_CLIENT_ID`, `REDDIT_APP_CLIENT_SECRET`
- R2 Storage: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- AI: `ANTHROPIC_API_KEY`
- Adzuna Jobs: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
- Web Push VAPID keys: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
  - Generate: `npx web-push generate-vapid-keys`

### 3. Database

```bash
npx prisma db push       # creates all tables in Neon
npx prisma studio        # view data in browser (optional)
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register → complete onboarding → explore jobs.

## Architecture

```
src/
├── app/
│   ├── (auth)/          # login, register
│   ├── (onboarding)/    # /setup 4-step form
│   ├── (dashboard)/     # jobs, discover, social, bookmarks, settings
│   └── api/             # all backend routes
├── services/
│   ├── jobs/            # Remotive, Jobicy, Adzuna + aggregator
│   ├── scraper/         # Cheerio + Playwright + Claude extraction
│   ├── reddit/          # cron fetcher + comment generator
│   ├── resume/          # PDF/DOCX parser + Claude structuring
│   ├── country/         # Restcountries + Numbeo + Claude (cached)
│   └── notifications/   # web-push helpers
├── components/          # all React components
├── hooks/               # client-side data hooks
├── lib/                 # singletons: prisma, claude, r2, auth
├── constants/           # app, jobs, API URLs, scrape targets
├── types/               # TypeScript interfaces
└── validations/         # Zod schemas
```

## Data Flows

| Feature | Flow |
|---------|------|
| **Jobs tab** | `/api/jobs/api` → aggregator → Remotive + Jobicy + Adzuna → relevance-scored |
| **Discover tab** | `/api/jobs/scrape` → Cheerio scrapes pages → Claude extracts jobs with confidence score |
| **Social tab** | Vercel Cron (9AM) → snoowrap fetches subreddits → Claude extracts job info → DB cache → push notification |
| **Comment gen** | User clicks Reply → Claude writes personalized comment → user edits → snoowrap posts to Reddit |

## Deployment (Vercel)

1. Push to GitHub, connect to Vercel
2. Add all env vars in Vercel dashboard
3. Deploy — `vercel.json` configures the daily cron automatically

## PWA Icons

Replace placeholder icons in `public/icons/` with real PNG files (192×192 and 512×512). Use `public/icons/icon.svg` as the source asset.
