# Claude Code Prompt — Personal Job Finder PWA

## Project Overview

Build a **personal job finder PWA** called **"XPRealm or XP-Realm or (whatever is good and unique)"** (name is a placeholder, keep it as a constant so it can be swapped). It is a personal-use web app that aggregates remote/freelance/part-time job opportunities from three distinct sources — structured job APIs, web scraping, and Reddit — with AI-powered assistance for job matching, overseas relocation info, and comment drafting. The app is installable as a PWA with web push notifications.

---

## Core Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (latest)
- **ORM:** Prisma
- **Database:** Neon (PostgreSQL) via `@neondatabase/serverless`
- **Auth:** NextAuth.js v5 (Auth.js) — email/password + Reddit OAuth
- **File Storage:** Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible)
- **Resume Parsing:** `pdf-parse` + `mammoth` (for .docx)
- **Web Scraping:** `cheerio` for static pages, `playwright` for JS-rendered (isolated to a dedicated scraper utility)
- **Reddit API:** `snoowrap` (Reddit API wrapper)
- **Push Notifications:** `web-push`
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) — claude-haiku-4-5 for cost efficiency
- **Cron:** Vercel Cron Jobs (via `vercel.json`)
- **HTTP Client:** `ky` (lightweight, typed)
- **Form Handling:** `react-hook-form` + `zod`
- **External APIs:** Remotive API, Jobicy API, Adzuna API, Restcountries API, Numbeo API
- **Date utilities:** `date-fns`
- **Notifications toast:** `sonner`

---

## Project Structure

Strictly enforce this folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (onboarding)/
│   │   └── setup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← default redirects to /jobs
│   │   ├── jobs/                     ← API Jobs flow
│   │   ├── discover/                 ← Scrape flow
│   │   └── social/                   ← Reddit + social flow
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── jobs/
│   │   │   ├── api/route.ts          ← Remotive + Jobicy + Adzuna
│   │   │   └── scrape/route.ts       ← Cheerio/Playwright scraper
│   │   ├── reddit/
│   │   │   ├── posts/route.ts        ← serve cached Reddit posts from DB
│   │   │   └── comment/route.ts      ← post comment via Reddit API
│   │   ├── cron/
│   │   │   └── reddit-fetch/route.ts ← Vercel Cron endpoint
│   │   ├── profile/
│   │   │   ├── route.ts
│   │   │   └── resume/route.ts       ← upload to R2 + parse
│   │   ├── bookmarks/route.ts
│   │   ├── notifications/
│   │   │   ├── subscribe/route.ts
│   │   │   └── send/route.ts
│   │   ├── country-info/route.ts     ← Restcountries + Numbeo + Claude cache
│   │   └── ai/
│   │       ├── generate-comment/route.ts
│   │       └── extract-job/route.ts  ← extract structured job from raw scraped HTML
├── components/
│   ├── ui/                           ← shadcn components (auto-generated)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── mobile-nav.tsx
│   ├── jobs/
│   │   ├── job-card.tsx              ← shared base card
│   │   ├── api-job-card.tsx          ← API source variant
│   │   ├── scraped-job-card.tsx      ← scraped source variant
│   │   ├── reddit-post-card.tsx      ← Reddit variant
│   │   ├── job-detail-panel.tsx      ← slide-over detail panel
│   │   ├── job-filters.tsx
│   │   └── bookmark-button.tsx
│   ├── onboarding/
│   │   ├── steps/
│   │   │   ├── personal-info-step.tsx
│   │   │   ├── job-preferences-step.tsx
│   │   │   ├── skills-step.tsx
│   │   │   └── resume-upload-step.tsx
│   │   └── onboarding-shell.tsx
│   ├── profile/
│   │   └── profile-form.tsx
│   ├── country-info/
│   │   └── country-info-panel.tsx
│   ├── reddit/
│   │   ├── comment-generator.tsx
│   │   └── comment-preview-modal.tsx
│   ├── notifications/
│   │   └── push-subscribe-button.tsx
│   └── shared/
│       ├── confidence-badge.tsx      ← for scraped job trust indicator
│       ├── source-tag.tsx
│       ├── empty-state.tsx
│       └── loading-skeleton.tsx
├── lib/
│   ├── auth.ts                       ← NextAuth config
│   ├── prisma.ts                     ← Prisma client singleton
│   ├── r2.ts                         ← Cloudflare R2 client
│   ├── claude.ts                     ← Anthropic client singleton
│   ├── web-push.ts                   ← web-push config
│   ├── reddit-client.ts              ← snoowrap config
│   └── utils.ts                      ← cn() and shared utils
├── services/
│   ├── jobs/
│   │   ├── remotive.service.ts
│   │   ├── jobicy.service.ts
│   │   ├── adzuna.service.ts
│   │   └── aggregator.service.ts     ← merges + dedupes all API sources
│   ├── scraper/
│   │   ├── cheerio-scraper.ts
│   │   ├── playwright-scraper.ts
│   │   └── job-extractor.ts          ← Claude-powered extraction from raw HTML
│   ├── reddit/
│   │   ├── reddit-fetcher.ts         ← cron fetch logic
│   │   └── comment-generator.ts      ← Claude comment generation
│   ├── resume/
│   │   └── resume-parser.ts          ← pdf-parse + mammoth + Claude structuring
│   ├── country/
│   │   └── country-info.service.ts   ← Restcountries + Numbeo + Claude
│   └── notifications/
│       └── push.service.ts
├── hooks/
│   ├── use-jobs.ts
│   ├── use-bookmarks.ts
│   ├── use-push-subscription.ts
│   └── use-profile.ts
├── types/
│   ├── job.types.ts
│   ├── profile.types.ts
│   ├── reddit.types.ts
│   └── country.types.ts
├── constants/
│   ├── app.constants.ts              ← APP_NAME, APP_URL, etc.
│   ├── jobs.constants.ts             ← job types, categories, subreddits list
│   ├── api.constants.ts              ← all external API base URLs + endpoints
│   ├── scrape-targets.constants.ts   ← list of blog/site URLs to scrape
│   └── country.constants.ts          ← supported countries list
├── validations/
│   ├── auth.schema.ts
│   ├── profile.schema.ts
│   └── job-filter.schema.ts
└── middleware.ts                     ← protect dashboard + onboarding check
```

---

## Constants — Keep Everything Centralized

In `constants/app.constants.ts`:

```ts
export const APP_NAME = "XPRealm or XP-Realm  or (whatever is good and unique)";
export const APP_DESCRIPTION = "Your personal remote job exploration realm";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
export const REDDIT_FETCH_CRON = "0 9 * * *"; // 9AM daily
export const COUNTRY_INFO_CACHE_DAYS = 7;
export const MAX_SCRAPED_RESULTS = 20;
export const MAX_API_RESULTS_PER_SOURCE = 30;
```

In `constants/jobs.constants.ts`:

```ts
export const JOB_TYPES = [
  { value: "part-time", label: "Part-time", priority: 1 },
  { value: "freelance", label: "Freelance", priority: 2 },
  { value: "contract", label: "Contract", priority: 3 },
  { value: "casual", label: "Casual", priority: 4 },
  { value: "gig", label: "Gig / One-off", priority: 5 },
  { value: "full-time", label: "Full-time", priority: 6 },
  { value: "internship", label: "Internship", priority: 7 },
] as const;

export const REDDIT_JOB_SUBREDDITS = [
  "forhire",
  "freelance",
  "remotework",
  "WorkOnline",
  "jobbit",
  "slavelabour",
  "HireaWriter",
  "web_design",
  "learnprogramming",
] as const;

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Writing",
  "Data",
  "Customer Support",
  "Finance",
  "DevOps",
  "Mobile",
  "AI/ML",
] as const;
```

In `constants/api.constants.ts`:

```ts
export const REMOTIVE_API = "https://remotive.com/api/remote-jobs";
export const JOBICY_API = "https://jobicy.com/api/v2/remote-jobs";
export const ADZUNA_API = "https://api.adzuna.com/v1/api/jobs";
export const RESTCOUNTRIES_API = "https://restcountries.com/v3.1";
export const NUMBEO_API = "https://www.numbeo.com/api";
```

In `constants/scrape-targets.constants.ts`:

```ts
export const SCRAPE_TARGETS = [
  {
    name: "We Work Remotely",
    url: "https://weworkremotely.com/remote-jobs",
    type: "static",
  },
  { name: "Remote OK", url: "https://remoteok.com", type: "static" },
  // add more as needed
] as const;
```

---

## Database Schema (Prisma)

```prisma
model User {
  id                String              @id @default(cuid())
  email             String              @unique
  name              String?
  passwordHash      String?
  image             String?
  country           String?
  city              String?
  portfolioUrl      String?
  payRangeMin       Int?
  payRangeMax       Int?
  currency          String?             @default("USD")
  onboardingDone    Boolean             @default(false)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  accounts          Account[]
  sessions          Session[]
  profile           UserProfile?
  bookmarks         Bookmark[]
  pushSubscriptions PushSubscription[]
  redditPosts       RedditPost[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  tokenType         String?
  scope             String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  expires      DateTime
  sessionToken String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  resumeUrl    String?
  resumeKey    String?  // R2 object key
  parsedSkills String[] // extracted from resume
  parsedExp    Json?    // structured experience array
  parsedEdu    Json?    // structured education array
  jobTypes     String[] // from JOB_TYPES values
  categories   String[] // from JOB_CATEGORIES values
  bio          String?
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Bookmark {
  id          String   @id @default(cuid())
  userId      String
  source      String   // "api" | "scrape" | "reddit"
  externalId  String?  // ID from source API
  title       String
  company     String?
  url         String
  jobType     String?
  location    String?
  salary      String?
  description String?
  tags        String[]
  postedAt    DateTime?
  savedAt     DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, url])
}

model RedditPost {
  id          String   @id @default(cuid())
  redditId    String   @unique
  subreddit   String
  title       String
  body        String?
  author      String
  url         String
  permalink   String
  flair       String?
  score       Int      @default(0)
  commentCount Int     @default(0)
  extractedJob Json?   // Claude-extracted structured job info
  fetchedAt   DateTime @default(now())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
}

model CountryInfoCache {
  id          String   @id @default(cuid())
  countryCode String   @unique
  data        Json     // full structured response
  cachedAt    DateTime @default(now())
  expiresAt   DateTime
}

model PushSubscription {
  id       String   @id @default(cuid())
  userId   String
  endpoint String   @unique
  p256dh   String
  auth     String
  createdAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Auth Setup (NextAuth v5)

Configure in `lib/auth.ts`:

- **Credentials provider** — email + password, bcrypt hashing
- **Reddit OAuth provider** — scope: `identity read submit` (submit needed for posting comments)
- Store sessions in Postgres via `@auth/prisma-adapter`
- Protect all `/dashboard/*` routes in `middleware.ts`
- If `onboardingDone === false` after login, redirect to `/setup`

---

## Onboarding Flow (`/setup`)

Multi-step form with progress indicator. Steps:

**Step 1 — Personal Info**

- Full name, country (dropdown from Restcountries), city, portfolio URL

**Step 2 — Job Preferences**

- Job types (multi-select, part-time and freelance pre-checked as they are priority)
- Preferred categories (multi-select from JOB_CATEGORIES)
- Pay range (min/max slider + currency select)

**Step 3 — Skills**

- Manual skill tag input (type + enter to add)
- Skills auto-merge with resume-parsed skills later

**Step 4 — Resume Upload**

- Upload PDF or DOCX
- On upload: send to `/api/profile/resume` → store in R2 → parse with pdf-parse/mammoth → send parsed text to Claude for structured extraction → save `parsedSkills`, `parsedExp`, `parsedEdu` back to `UserProfile`
- Show parsed preview (skills chips, experience list) so user can verify
- Show loading state during AI parsing

On completion: set `onboardingDone = true`, redirect to `/jobs`

---

## Dashboard Layout

Persistent sidebar (desktop) / bottom nav (mobile):

```
┌─────────────────────────────────────────┐
│  XPRealm or XP-Realm  or (whatever is good and unique)         [profile] [(anythings which suits the name) icon] │
├──────────┬──────────────────────────────┤
│          │                              │
│  Jobs    │    Main Content Area         │
│  Discover│                              │
│  Social  │                              │
│  Bookmarks                              │
│  Settings│                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

The sidebar should show:

- Active tab indicator
- User's name + avatar
- Push notification toggle (bell icon in topbar)
- Unread badge on Social tab when new Reddit posts arrive

---

## Flow 1 — Jobs Tab (`/jobs`) — API Sources

**Behavior:**

- On page load, fetch from `/api/jobs/api` which aggregates Remotive + Jobicy + Adzuna
- Pass user's `parsedSkills` + `jobTypes` + `categories` as query filters
- Results merged and deduped by URL
- Show filters bar: job type, category, keyword search, salary range, date posted
- Default sort: relevance to user profile (keyword overlap score computed server-side)

**Job Card Design:**

- Company logo (fallback initials avatar)
- Job title + company name
- Tags: job type badge, category badge, source badge ("Remotive", "Jobicy", "Adzuna")
- Location (remote indicator + actual location if specified)
- Salary range if available
- Posted date (relative: "2 days ago")
- Bookmark button (top right of card)

**Job Detail Panel:**

- Clicking a card opens a slide-over panel (not a new page)
- Full description rendered as markdown
- Skills/requirements highlighted if they match user's parsed skills
- Salary, location, job type, posted date
- **Country Info Section:** if job has a location, show a collapsible panel:
  - Fetches from `/api/country-info?code=XX`
  - Shows: cost of living index (Numbeo), currency, timezone, work permit info, freelancer tax notes, payment methods availability — all from the cached Claude+API response
- "Apply Now" CTA button → opens `url` in new tab
- Bookmark button

---

## Flow 2 — Discover Tab (`/discover`) — Scraped Sources

**Behavior:**

- On page load, fetch from `/api/jobs/scrape`
- Backend scrapes `SCRAPE_TARGETS` using Cheerio
- Raw HTML passed to Claude (`extract-job` endpoint) to extract: title, company, description, url, job type, skills, salary if present
- Returns structured results with a `confidenceScore` (0–1, Claude should output this)
- Each card shows a `ConfidenceBadge` (High / Medium / Low based on score)

**Scraped Job Card Design:**
Same as API card but with:

- "Scraped from [site name]" source tag (distinct visual style from API source tag)
- Confidence badge (color-coded: green/yellow/orange)
- "View Source Page" secondary button alongside "Apply Now"

**Important UX note:** Add a banner at top of Discover tab explaining these are AI-extracted results and may be less accurate than verified listings.

---

## Flow 3 — Social Tab (`/social`) — Reddit

**Layout:**
Two sub-sections on this page:

**Section A — Connect Socials**

- If Reddit account not connected: show a Reddit OAuth connect button
- Once connected: show connected status with username + disconnect option
- (Placeholder cards for future socials: LinkedIn, Twitter — show as "Coming Soon" locked state)

**Section B — Reddit Job Posts**

- Served from DB (populated by Vercel Cron daily)
- Show last fetched timestamp ("Last updated 3 hours ago")
- Filter by subreddit (dropdown from REDDIT_JOB_SUBREDDITS)
- Filter by flair if available

**Reddit Post Card Design:**

- Subreddit tag + flair badge
- Post title
- Author + posted time
- Score + comment count
- Short body excerpt (2-3 lines, truncated)
- If `extractedJob` exists from Claude: show a small structured chip row (job type, skills required)
- Two action buttons:
  - "View on Reddit" → opens permalink
  - "Generate Comment" → only enabled if Reddit account is connected

**Generate Comment Flow:**

1. User clicks "Generate Comment" on a Reddit post card
2. Modal opens with loading state
3. Call `/api/ai/generate-comment` with: post title + body + user's parsedSkills + parsedExp + portfolioUrl
4. Claude generates a personalized, contextual comment as if the user wrote it
5. Show comment in an editable `<textarea>` inside the modal
6. User can edit freely
7. "Post to Reddit" button → calls `/api/reddit/comment` with the post ID + comment body + user's Reddit access token
8. Show success toast via `sonner`, close modal

---

## Bookmarks Tab (`/bookmarks`)

- Shows all saved jobs from all three flows
- Filter by source: All / API Jobs / Scraped / Reddit
- Same card designs as their respective flows
- Bulk delete option
- Each card still has the detail panel on click

---

## Settings Tab

- Profile edit form (all onboarding fields editable)
- Resume re-upload option (shows current resume filename + upload date)
- Push notifications toggle (subscribe/unsubscribe)
- Connected accounts section (Reddit OAuth status)
- Danger zone: delete account

---

## Vercel Cron — Reddit Fetch

In `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reddit-fetch",
      "schedule": "0 9 * * *"
    }
  ]
}
```

The cron handler at `/api/cron/reddit-fetch/route.ts`:

1. Verify `CRON_SECRET` header for security
2. For each subreddit in `REDDIT_JOB_SUBREDDITS`, fetch top 25 posts from last 24h using snoowrap with app-level auth (not user auth)
3. For each post: upsert into `RedditPost` table by `redditId`
4. Run Claude extraction on posts that don't have `extractedJob` yet
5. After all fetches: call push.service to send a web push to all subscribed users: "X new remote opportunities found on Reddit"

---

## Push Notifications

`/api/notifications/subscribe` — saves the push subscription (endpoint, p256dh, auth) to `PushSubscription` table linked to user.

`/api/notifications/send` — internal endpoint called by cron after Reddit fetch. Sends push to all subscribed users via `web-push`.

In `lib/web-push.ts`:

```ts
import webpush from "web-push";
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);
```

Push notification payload:

```json
{
  "title": "XPRealm or XP-Realm  or (whatever is good and unique) — New Opportunities",
  "body": "12 new remote job posts found on Reddit matching your profile",
  "icon": "/icons/icon-192.png",
  "url": "/social"
}
```

---

## PWA Setup

Install `@ducanh2912/next-pwa` and configure in `next.config.ts`.

`public/manifest.json`:

```json
{
  "name": "XPRealm or XP-Realm  or (whatever is good and unique)",
  "short_name": "XPRealm or XP-Realm  or (whatever is good and unique)",
  "description": "Your personal remote job radar",
  "start_url": "/jobs",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Service worker handles:

- Static asset caching
- Offline fallback page at `/offline`
- Push notification click → opens PWA to `/social`

---

## AI Integration (Claude API)

All Claude calls go through `lib/claude.ts` singleton. Use `claude-haiku-4-5` for all calls (cost efficiency).

**1. Resume parsing** (`services/resume/resume-parser.ts`):
Prompt: Given the following resume text, extract a structured JSON with keys: `skills` (string[]), `experience` ({ title, company, duration, description }[]), `education` ({ degree, institution, year }[]), `summary` (string). Return only valid JSON.

**2. Job extraction from raw HTML** (`services/scraper/job-extractor.ts`):
Prompt: Given the following scraped webpage text, extract any job posting information into JSON with keys: `title`, `company`, `description`, `jobType`, `skills`, `salary`, `location`, `applyUrl`, `confidenceScore` (0 to 1 — how confident you are this is a real job posting). Return only valid JSON or null if no job found.

**3. Comment generation** (`services/reddit/comment-generator.ts`):
Prompt: You are [user's name]. Given the following Reddit job post and your profile below, write a natural, genuine comment expressing interest in this role. Make it specific to the post, not generic. Keep it under 150 words. Sound human, not AI.
Post: [title + body]
Your profile: skills: [...], experience: [...], portfolio: [url]

**4. Country info** (`services/country/country-info.service.ts`):
Prompt: For a remote freelancer or part-time worker living in [country], provide a structured JSON with: `workPermitNotes` (string), `taxRegistrationNotes` (string), `availablePaymentMethods` (string[]), `freelancerTips` (string[]), `visaInfo` (string). Be practical and accurate.
Then merge with Restcountries (currency, timezone, flag, region) and Numbeo (cost of living index, rent index) data. Cache the full merged object in `CountryInfoCache` for `COUNTRY_INFO_CACHE_DAYS` days.

---

## UI Design Direction

Use shadcn/ui as the component base but apply a **dark, editorial, high-contrast** theme throughout. Not the generic dark mode — think refined, data-dense, purposeful.

**Theme tokens (in `globals.css`):**

```css
:root {
  --background: 10 10 10; /* near black */
  --foreground: 240 240 240; /* off white */
  --card: 16 16 16;
  --card-foreground: 240 240 240;
  --border: 30 30 30;
  --primary: 99 255 180; /* electric mint — the signature accent */
  --primary-foreground: 10 10 10;
  --muted: 28 28 28;
  --muted-foreground: 120 120 120;
  --accent: 99 255 180;
  --destructive: 255 80 80;
  --radius: 0.625rem;
}
```

**Typography:**

- Display/headings: `Syne` (Google Fonts) — geometric, editorial
- Body: `DM Sans` — clean, readable

**Visual details:**

- Subtle dot-grid background pattern on auth and onboarding pages
- Cards with `border border-border/50 hover:border-primary/30` transition
- Source badges with distinct colors: API jobs (blue), Scraped (amber), Reddit (orange-red)
- Confidence badges: High (mint green), Medium (yellow), Low (orange)
- Job type badges: Part-time and Freelance use primary accent color, others use muted

**Motion:**

- Cards stagger-fade in on load (CSS animation-delay)
- Slide-over panel slides in from right with smooth transition
- Onboarding steps slide left/right between steps
- Skeleton loaders match card dimensions exactly

---

## Environment Variables

Document all required env vars in `.env.example`:

```env
# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=XPRealm or XP-Realm  or (whatever is good and unique)

# Auth
AUTH_SECRET=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Database
DATABASE_URL=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Adzuna
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# Numbeo
NUMBEO_API_KEY=

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# Cron Security
CRON_SECRET=

# Reddit App-level (for cron, not user auth)
REDDIT_APP_CLIENT_ID=
REDDIT_APP_CLIENT_SECRET=
```

---

## Additional Implementation Notes

1. **Error handling:** All API routes return consistent error shapes `{ error: string, code: string }`. Use a shared `apiError()` utility.

2. **Loading states:** Every data fetch must have a corresponding skeleton loader component that matches the card layout.

3. **Empty states:** Every tab must have a designed empty state (not just "No results") — include the reason and an action (e.g., "No jobs found matching your profile. Try updating your skills in Settings.")

4. **Rate limiting:** Add basic rate limiting on scrape and AI endpoints using an in-memory store or Upstash Redis (if available). At minimum, add a debounce on the scrape endpoint.

5. **Resume file handling:** Accept only PDF and DOCX. Max file size 5MB. Validate on client and server. Store in R2 with key pattern `resumes/{userId}/{timestamp}.{ext}`.

6. **Reddit token refresh:** Store `expiresAt` on the Account model. Before any Reddit API call on behalf of a user, check if the token is expired and refresh using the stored `refreshToken`.

7. **TypeScript:** No `any` types. All API responses must have corresponding TypeScript interfaces in `types/`. Zod schemas in `validations/` should mirror Prisma types where possible.

8. **Mobile-first:** All layouts must be fully responsive. Bottom nav on mobile, sidebar on desktop. Job detail panel is a full-screen sheet on mobile, a slide-over on desktop.

9. **Accessibility:** All interactive elements must have proper aria labels. Keyboard navigation must work throughout.

10. **`README.md`:** Generate a complete README with setup instructions, env var explanations, architecture overview, and how to run locally.
