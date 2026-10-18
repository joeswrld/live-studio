# Live Studio (Phase 1 foundation)

React + TypeScript + Tailwind + Supabase. Multi-camera live production web app, foundation only.

## Setup
1. `npm install`
2. Create a Supabase project and run `supabase/migrations/20261018000000_initial_schema.sql` (SQL editor or `supabase db push`).
3. `cp .env.example .env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. `npm run dev`

## What works (backed by real Supabase data)
- Email/password sign up, login, logout; automatic profile row via trigger
- Production sessions: create, rename, open, delete (UUID id + owner, RLS-scoped)
- Camera slots with private join links; the join page reports online/offline presence (heartbeat) and shows a local-only camera preview
- Studio: preview/program selection saved to the session; CUT and SWAP
- Stream destinations (platform + RTMP URL metadata only, no keys)
- Recordings library: list, rename, delete metadata
- Account settings: display name, password

## Not implemented yet (UI says so)
Camera video transport, video composition, recording, live streaming output, account deletion.

## Architecture
- `src/components/studio/VideoMonitor.tsx` already accepts a `MediaStream`; transport only needs to supply it.
- `src/hooks/useCameras.ts` is the realtime camera/presence layer.
- Suggested next-phase modules: `src/transport/` (WebRTC), `src/composition/`, `src/recording/`, `src/streaming/`.
