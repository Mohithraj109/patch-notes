# Patch Notes

> **AI-powered release notes from your Git history.** Turn a messy week of commits into polished, human-readable patch notes — automatically.

![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-blue?logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-via%20Prisma-lightblue?logo=sqlite)

## What it does

Instead of manually sifting through commits like:

```
fix auth redirect
update dashboard API
refactor user service
fix mobile nav
add loading state
remove unused dependency
```

Patch Notes produces:

```
Authentication
Improved the sign-in flow and fixed an issue that could redirect
users incorrectly after authentication.

Dashboard
Added faster loading states and improved the dashboard API integration.

Navigation
Fixed mobile navigation behavior on smaller screens.

Maintenance
Cleaned up unused dependencies and refactored the user service.
```

## How it works

```
Git commits → Filter noise → Classify changes → Group by area → Gemini → Patch Notes
```

1. **Fetch** — Connects to GitHub via the API and retrieves commits for a date range (including diffs)
2. **Filter** — Removes trivial commits: typos, console.log removals, whitespace changes
3. **Classify** — Categorizes each commit deterministically: `feature` / `fix` / `refactor` / `performance` / `security` / `maintenance`
4. **Group** — Groups related commits by product area: `authentication`, `dashboard`, `navigation`, `api`, etc.
5. **Generate** — Sends structured data (NOT raw commits) to Gemini 2.0 Flash with a strict prompt
6. **Output** — Streams patch notes back to the UI in real-time

> **Key design principle:** Deterministic code handles logic. AI handles language.
> The model is instructed to *not invent functionality* — it only writes about what actually happened.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| AI | Google Gemini 2.0 Flash |
| Git | GitHub API (Octokit) + local git (simple-git) |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS (brutalist dark theme) |

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd patch-notes
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# Get from https://github.com/settings/tokens (needs: repo scope)
GITHUB_TOKEN=your_github_token

# SQLite file path
DATABASE_URL="file:./dev.db"
```

### 3. Initialize the database

```bash
npm run db:push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Go to the **Dashboard** (`/dashboard`)
2. Enter your **GitHub token** (or set `GITHUB_TOKEN` in `.env.local`)
3. **Select a repository** from the dropdown
4. Choose a **date range** (or use a preset: This Week / Last Week / Last 30 Days)
5. Pick a **writing tone**: Human, Technical, Executive, Casual, Marketing, or Changelog
6. Click **FETCH COMMITS** → review the classified commits
7. Click **GENERATE PATCH NOTES** → watch Gemini stream the output
8. **Copy**, **download as .txt**, or **save** to history

## Writing Tones

| Tone | Best for |
|------|----------|
| **Human** | End users, blog posts |
| **Technical** | Developer changelogs |
| **Executive** | Leadership updates |
| **Casual** | Internal Slack messages |
| **Marketing** | Product announcements |
| **Changelog** | Classic Added/Fixed/Changed format |

## Architecture

```
src/
├── app/
│   ├── page.tsx                ← Landing page
│   ├── dashboard/page.tsx      ← Main app
│   └── api/
│       ├── repos/route.ts      ← List GitHub repos
│       ├── commits/route.ts    ← Fetch + filter + classify commits
│       ├── generate/route.ts   ← Stream patch notes (Gemini)
│       └── reports/route.ts    ← Save/list reports (Prisma)
├── components/
│   ├── RepoSelector.tsx        ← Searchable repo dropdown
│   ├── DateRangePicker.tsx     ← Date range with presets
│   ├── CommitPreview.tsx       ← Grouped commit list with impact bars
│   ├── ToneSelector.tsx        ← Six-tone picker
│   ├── PatchNotesOutput.tsx    ← Streaming output with copy/download
│   └── WeeklyDigest.tsx        ← Stats sidebar widget
└── lib/
    ├── git/
    │   ├── types.ts            ← TypeScript types
    │   ├── github.ts           ← Octokit client
    │   └── local.ts            ← simple-git client
    ├── processor/
    │   ├── filter.ts           ← Remove trivial/duplicate commits
    │   ├── classifier.ts       ← Detect category + area deterministically
    │   ├── grouper.ts          ← Group by area, build AI payload
    │   └── stats.ts            ← Compute commit statistics
    ├── ai/
    │   ├── gemini.ts           ← Gemini streaming client
    │   └── prompts.ts          ← Prompt templates (6 tones)
    └── db/
        └── client.ts           ← Prisma singleton
```

## Preventing Hallucinations

The AI layer follows strict rules:

1. Receives **structured commit data** — not raw text
2. Prompted: *"Do NOT invent functionality that is not listed"*
3. Prompted: *"Do NOT exaggerate the impact of changes"*
4. Categorization is **deterministic** (regex + keyword rules, not AI)
5. Area detection is **deterministic** (file path + message patterns)

The LLM only handles the final language transformation.

## Scripts

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run db:push     # Push schema to SQLite (no migration history)
npm run db:migrate  # Create a migration
npm run db:studio   # Open Prisma Studio (DB browser)
```

## License

MIT
