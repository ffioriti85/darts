# Darts Training App

Mobile-first Next.js app to log darts training sessions with Clerk auth and Supabase storage.

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) application
- A [Supabase](https://supabase.com) project

## Install

```bash
cd web
npm install
```

## Environment

Create `.env.local` with at least:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/login/sign-up` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (retrievable via Supabase MCP `get_project_url`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional; legacy anon key (MCP `get_publishable_keys`) if you add client-side Supabase later |
| `SUPABASE_SERVICE_ROLE_KEY` | **Paste from Supabase Dashboard → Settings → API → `service_role` (secret).** The Supabase MCP does not expose this key. |

Clerk can run in keyless dev mode without keys until you claim the app in the dashboard.

## Database

The schema is in `supabase/schema.sql`. It has been applied to the **Darts** Supabase project as migration `darts_training_initial_schema` (tables `users`, `sessions`, `throws` with RLS enabled). To recreate elsewhere, run that SQL in the SQL editor or use `apply_migration` via MCP.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login`, then start a session from the home screen.

## Scripts

- `npm run dev` — development server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## Deploy (Render later)

Use the production build command `npm run build` and start command `npm run start`. Set the same environment variables on Render. Prefer storing `SUPABASE_SERVICE_ROLE_KEY` as a secret.
