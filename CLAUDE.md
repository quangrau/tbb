# The Battle Board

A real-time multiplayer learning game for primary school students (grades 2-4) featuring Singapore Math curriculum.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Backend:** Supabase (PostgreSQL + Realtime WebSocket)
- **Hosting:** Vercel

## Project Structure

```
src/
├── config/          # Supabase client configuration
├── types/           # TypeScript types (database, room, player, question)
├── stores/          # Zustand stores (gameStore, roomStore)
├── services/        # API services (room, game, realtime)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── components/      # Reusable UI components
└── utils/           # Utility functions
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Local Development

### Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase stack (PostgreSQL, Auth, Realtime, Studio)
supabase start

# If `supabase start` gets stuck at "Waiting for health checks...", use:
supabase start -x edge-runtime

# Apply migrations and seed data
supabase db reset

# Stop when done
supabase stop
```

Local URLs:

- Studio: http://localhost:54323
- API: http://localhost:54321
- Database: postgresql://postgres:postgres@localhost:54322/postgres

### Environment Variables

Required in `.env.local`:

```
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_ANON_KEY=<publishable_or_anon_key>
```

Get keys from: Dashboard → Settings → API Keys

- New format (2025+): `sb_publishable_xxx`
- Legacy format: `eyJhbGciOi...` (anon key)

For local Supabase:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<from supabase start output>
```

## Key Concepts

### Room System

- 6-character room codes (no ambiguous chars: 0/O, 1/I/L)
- MVP: 2 players per room, scalable to 10+
- Room statuses: waiting → ready → playing → finished

### Gameplay

- 10 questions per challenge
- 10 seconds per question
- Scoring: 1 point per correct answer, faster time breaks ties

### Real-time Sync

- Uses Supabase Realtime for WebSocket subscriptions
- Syncs: player joins, ready status, game start, progress, completion

### Anonymous Identity

- Device ID stored in localStorage (no auth for MVP)
- Nickname chosen when joining room

## Database Tables

- `questions` - Quiz questions by grade/term
- `rooms` - Game rooms with settings and status
- `room_players` - Players in each room (N-player scalable)
- `answers` - Individual answer records for review/analytics

## Documentation

- `doc/` - Product specs, requirements, user documentation
  - `battle-board-product-spec.md` - Product vision, features, user flows
- `plan/` - Technical specs, implementation plans, architecture
  - `battle-board-technical-spec.md` - Tech stack, database schema, implementation phases

## Claude Code Settings

Pre-approved permissions in `.claude/settings.json` allow autonomous implementation:

- File operations (read, edit, write, glob, grep)
- npm commands (install, run, test, create)
- Git commands (except force push, hard reset)
- Basic shell commands (ls, mkdir, cp, mv, etc.)

To run autonomously: `claude` then give implementation instructions.
