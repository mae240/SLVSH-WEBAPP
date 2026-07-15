# SLVSH Bets

A prediction game for head-to-head ski tournaments. Users forecast the winner of
each match and the winner's letter score, and compete on per-round and overall
leaderboards.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.7, Vite 6
- **Backend / Auth / Database:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Data fetching:** TanStack React Query v5
- **Forms & validation:** React Hook Form + Zod
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 3.4
- **Utilities:** date-fns, clsx
- **Deployment:** Vercel

## Features

- Email/password authentication via Supabase Auth
- Tournaments organized into rounds and matches
- Per-match predictions: pick the winner and the winner's letter score
  (`S`, `SL`, `SLV`, `SLVS`)
- Scoring engine: 1 point for the correct winner, 2 additional points for the
  correct letters (max 3 points per match)
- Deadline- and lock-based prediction visibility: predictions are private until a
  round is locked, then revealed to everyone
- Overall and per-round leaderboards
- Admin area to manage tournaments, rounds, matches, results, and predictions
- Role-based access enforced both in the UI and via Postgres Row Level Security

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase project values:

```bash
cp .env.local.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database

Apply the SQL migrations in `supabase/migrations/` in order — for example via the
Supabase CLI:

```bash
supabase db push
```

or by running each migration file in the Supabase SQL editor.

### 4. Run the development server

```bash
npm run dev
```

### Available scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
  components/   Reusable UI components
  pages/        Route-level pages (dashboard, tournament, round, leaderboard, admin, ...)
  hooks/        Custom hooks wrapping Supabase queries and mutations
  lib/          Supabase client, React Query client, utilities
  schemas/      Zod validation schemas
  types/        Shared TypeScript types
supabase/
  migrations/   PostgreSQL schema and RLS policies
public/         Static assets
```

The app is a single-page application; `vercel.json` rewrites all routes to
`index.html` for client-side routing.
