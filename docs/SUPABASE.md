# Supabase Integration

## Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order:
   ```bash
   supabase db push
   # or apply via SQL editor:
   # 001_initial_schema.sql → 002_seed_education.sql → 003_cyra_core_tables.sql
   ```
3. Configure `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...  # server only
   ```

## Authentication

| Method | Implementation |
|--------|----------------|
| Email/password | `supabase.auth.signUp` / `signInWithPassword` |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |

### Google OAuth Setup (Supabase Dashboard)

1. **Authentication → Providers → Google** — enable and add Client ID/Secret from Google Cloud Console
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:5173` (dev) or production URL
   - Redirect URLs: `http://localhost:5173/auth/callback`
3. Google Cloud Console → Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`

PKCE flow is enabled (`flowType: 'pkce'`). Callback handled at `/auth/callback`.

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profile (extends auth.users) | Own row only |
| `period_logs` | Menstrual cycle tracking | CRUD own rows, soft delete |
| `sleep_logs` | Daily sleep (unique per date) | CRUD own rows |
| `weight_logs` | Weight tracking | CRUD own rows |
| `mood_logs` | Daily mood & energy | CRUD own rows |
| `androgen_logs` | Hormone symptoms & labs | CRUD own rows |
| `quiz_results` | Onboarding & health quizzes | CRUD own rows |
| `doctor_reports` | AI visit summaries | CRUD own rows |
| `chat_history` | Sakhi AI messages | Select/insert own rows |

All health log tables include:
- `client_id` — idempotency for offline sync
- `sync_status` — `synced | pending | conflict`
- `deleted_at` — soft delete (where applicable)

## Row Level Security

Every table uses `auth.uid() = user_id` policies split by operation:
- `SELECT` — excludes soft-deleted rows
- `INSERT WITH CHECK` — user_id must match auth.uid()
- `UPDATE` / `DELETE` — own rows only

No table allows cross-user access. Service role key is server-only.

## Client Architecture

```
client/src/
├── lib/supabase.ts          # Typed Supabase client
├── types/supabase.ts        # TypeScript interfaces
├── lib/db/                  # CRUD functions per table
├── hooks/                   # React hooks (usePeriodLogs, etc.)
└── lib/offline/             # IndexedDB sync queue
```

## Offline Sync Strategy

```
┌─────────────┐     online      ┌──────────────┐
│  React App  │ ───────────────▶│   Supabase   │
└─────────────┘                 └──────────────┘
       │ offline
       ▼
┌─────────────┐     online      ┌──────────────┐
│  IndexedDB  │ ──flush queue──▶│   Supabase   │
│  sync_queue │                 └──────────────┘
│  cache      │
└─────────────┘
```

1. **Reads**: Network first → fallback to IndexedDB cache
2. **Writes offline**: Queue mutation in IndexedDB with `client_id`
3. **Reconnect**: `flushSyncQueue()` applies pending ops (max 3 retries)
4. **UI**: `OfflineSyncBanner` shows status + manual sync button
5. **Hook**: `useOfflineSync()` exposes `online`, `pending`, `sync()`

## Usage Examples

```tsx
// Period logs
const { data, loading, create, remove } = usePeriodLogs({ limit: 12 });
await create({ period_start: '2026-06-01', flow_intensity: 'medium' });

// Mood log (upsert by date)
const { upsert } = useMoodLogs();
await upsert({ logged_date: '2026-06-20', mood: 'anxious', energy_level: 4 });

// Google sign-in
const { signInWithGoogle } = useAuth();
await signInWithGoogle();
```
