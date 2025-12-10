# Data Models

Tables live in Postgres (Supabase) and are managed via migrations/SQL in the service, not auto-created at runtime.

## users
- `id` (TEXT, PK) — UUID.
- `username` (TEXT, UNIQUE, NOT NULL).
- `created_at` (TEXT, default current timestamp).

## habits
- `id` (TEXT, PK) — UUID.
- `user_id` (TEXT, FK → users.id, NOT NULL).
- `name` (TEXT, NOT NULL).
- `description` (TEXT, nullable).
- `created_at` (TEXT, default current timestamp).

## journal_entries
- `id` (TEXT, PK) — UUID.
- `user_id` (TEXT, FK → users.id, NOT NULL).
- `content` (TEXT, NOT NULL).
- `ai_summary` (TEXT, nullable).
- `ai_emotion` (TEXT, nullable).
- `ai_affirmation` (TEXT, nullable).
- `created_at` (TEXT, default current timestamp).

## habit_completions
- `id` (TEXT, PK) — UUID.
- `habit_id` (TEXT, FK → habits.id, NOT NULL).
- `journal_entry_id` (TEXT, FK → journal_entries.id, NOT NULL).
- `completed_at` (TEXT, default current timestamp).
- `UNIQUE(habit_id, journal_entry_id)` enforces a single completion per entry/habit pair.

## Relationships
- A user has many habits and journal entries.
- Habit completions join a habit to a journal entry; they cascade delete when the habit or entry is removed.
- Dashboard aggregates stats over the last 30 days using `journal_entries` and `habit_completions`.
