# Build Plan

## Phase 1 — Project Init + SQL Schema + RLS ✓
**Goal**: Runnable Vite project + vollständige DB-Migration

- [x] npm + Vite + dependencies installieren
- [x] `src/` folder structure anlegen
- [x] `supabase/migrations/001_initial.sql` — tables, indexes, views, triggers, RLS
- [x] `supabase/migrations/002_fix_winner_letters.sql` — rename loser→winner letters
- [x] `.env.local` mit Supabase Keys
- [x] Supabase client (`src/lib/supabase.ts`)
- [x] TypeScript types (`src/types/database.ts`)
- [x] Supabase CLI linked + Migrations live in DB

---

## Phase 2 — Auth + Routing + Shell ✓
**Goal**: Login funktioniert, Routing steht, protected routes

- [x] Auth context + hook (`useAuth`)
- [x] Login page
- [x] Protected route wrapper
- [x] Admin route wrapper
- [x] React Query client setup
- [x] App shell / layout component

---

## Phase 3 — Prediction Flow (Kernfunktion) ✓
**Goal**: User kann Predictions abgeben und bearbeiten

- [x] Hooks: `useTournaments`, `useRounds`, `useMatches`, `usePredictions`
- [x] Tournament list page (Dashboard)
- [x] Tournament detail page
- [x] Round prediction page
  - Countdown bis Deadline
  - Formular pro Match (winner + letters)
  - Deadline-Check → readonly nach Ablauf
- [x] After-deadline: alle Predictions sichtbar

---

## Phase 4 — Admin UI
**Goal**: Admin kann alles verwalten und Ergebnisse eintragen

- [ ] Admin dashboard page
- [ ] Tournament create/edit form
- [ ] Round create/edit form (inkl. Deadline)
- [ ] Match create/edit form
- [ ] Round lock/unlock
- [ ] Result entry per match (winner + loser letters)
- [ ] Prediction inspector (alle User-Predictions sehen)

---

## Phase 5 — Leaderboard
**Goal**: Punktestand wird korrekt berechnet und angezeigt

- [ ] SQL view `scored_predictions` fertigstellen
- [ ] SQL view `leaderboard_totals` fertigstellen
- [ ] Leaderboard hook (`useLeaderboard`)
- [ ] Leaderboard page (gesamt + pro Runde)
- [ ] Leaderboard-Widget auf Tournament page

---

## Phase 6 — Polish + Edge Cases
**Goal**: Production-ready MVP

- [ ] Form validation feedback überall
- [ ] Empty states
- [ ] Mobile layout prüfen
- [ ] Seed script (`supabase/seed.sql`) — SLVSH Cup Grandvalira 2026
- [ ] `.env.local.example`
- [ ] Setup instructions (`docs/SETUP.md`)
- [ ] CLAUDE.md aktualisieren

---

## Progress Log

| Phase | Status |
|-------|--------|
| 1     | ✓ done  |
| 2     | ✓ done  |
| 3     | ✓ done  |
| 4     | pending |
| 5     | pending |
| 6     | pending |
