# Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--|| profiles : extends
    profiles ||--|| user_preferences : has
    profiles ||--o{ cycle_logs : tracks
    profiles ||--o{ symptom_entries : logs
    profiles ||--o{ ai_conversations : owns
    profiles ||--o{ doctor_reports : generates
    profiles ||--o{ article_bookmarks : saves
    profiles ||--o{ article_read_progress : reads

    symptom_entries ||--o{ symptom_details : contains
    ai_conversations ||--o{ ai_messages : contains
    education_articles ||--o{ article_bookmarks : bookmarked
    education_articles ||--o{ article_read_progress : read

    auth_users {
        uuid id PK
        string email
        jsonb raw_user_meta_data
    }

    profiles {
        uuid id PK,FK
        string email
        string full_name
        string avatar_url
        date date_of_birth
        string timezone
        boolean onboarding_completed
        text[] health_goals
        text[] conditions
        timestamptz created_at
        timestamptz updated_at
    }

    user_preferences {
        uuid id PK
        uuid user_id FK,UK
        string theme
        boolean notifications_enabled
        time reminder_time
        int cycle_length_avg
        int period_length_avg
        boolean privacy_analytics
        string language
    }

    cycle_logs {
        uuid id PK
        uuid user_id FK
        date period_start
        date period_end
        int cycle_length
        text notes
    }

    symptom_entries {
        uuid id PK
        uuid user_id FK
        date logged_date UK
        enum cycle_phase
        enum mood
        int energy_level
        numeric sleep_hours
        int sleep_quality
        text notes
        text[] triggers
    }

    symptom_details {
        uuid id PK
        uuid entry_id FK
        string symptom_name
        enum category
        enum severity
        numeric duration_hours
        text notes
    }

    education_articles {
        uuid id PK
        string slug UK
        string title
        string summary
        text content
        enum category
        int read_time_minutes
        text[] tags
        boolean is_featured
        timestamptz published_at
    }

    ai_conversations {
        uuid id PK
        uuid user_id FK
        string title
        text context_summary
    }

    ai_messages {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        int token_count
    }

    doctor_reports {
        uuid id PK
        uuid user_id FK
        string title
        date date_range_start
        date date_range_end
        text summary
        jsonb key_symptoms
        text[] questions_for_doctor
        enum status
        timestamptz shared_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        string action
        string resource_type
        uuid resource_id
        jsonb metadata
        inet ip_address
    }
```

## Enums

| Enum | Values |
|------|--------|
| `symptom_category` | physical, emotional, cognitive, sleep, digestive, skin, energy |
| `severity_level` | none, mild, moderate, severe |
| `cycle_phase` | menstrual, follicular, ovulation, luteal, unknown |
| `mood_type` | calm, anxious, irritable, sad, energetic, foggy, neutral |
| `article_category` | pmos_basics, symptom_management, nutrition, mental_health, doctor_prep, lifestyle, research |
| `report_status` | draft, ready, shared |

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `cycle_logs` | `(user_id, period_start DESC)` | Recent cycles lookup |
| `symptom_entries` | `(user_id, logged_date DESC)` | Daily entries + date range queries |
| `symptom_details` | `(entry_id)` | Join performance |
| `ai_conversations` | `(user_id, updated_at DESC)` | Recent conversations |
| `ai_messages` | `(conversation_id, created_at)` | Message history |
| `doctor_reports` | `(user_id, created_at DESC)` | Report listing |
| `audit_logs` | `(user_id, created_at DESC)` | Audit trail |

## Row Level Security

All user-owned tables enforce `auth.uid() = user_id` policies. Education articles have a public read policy. Audit logs allow insert/select on own records only.

## Triggers

| Trigger | Event | Action |
|---------|-------|--------|
| `on_auth_user_created` | INSERT on `auth.users` | Creates profile + default preferences |
| `*_updated_at` | UPDATE on all mutable tables | Sets `updated_at = NOW()` |

## Migrations

```
supabase/migrations/
├── 001_initial_schema.sql    # Tables, enums, RLS, triggers
└── 002_seed_education.sql    # Sample education articles
```

Run with: `supabase db push` or apply via Supabase dashboard SQL editor.
