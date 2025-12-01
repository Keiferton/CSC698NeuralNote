# API Surface (MVP)

Base URL: `http://localhost:3001/api`

## Users
- `POST /users` — body `{ username }` → creates or returns existing user.
- `GET /users/:id` — fetch user by id.

## Habits
- `GET /habits/user/:userId` — list habits for a user.
- `POST /habits` — body `{ userId, name, description? }` → create habit.
- `GET /habits/:id` — fetch habit.
- `PUT /habits/:id` — body `{ name, description? }` → update habit.
- `DELETE /habits/:id` — delete habit.
- `GET /habits/user/:userId/completions?startDate&endDate` — habit completion counts over a window.

## Journal
- `GET /journal/user/:userId?limit&offset` — list entries with attached completed habits.
- `POST /journal` — body `{ userId, content }` → create entry, auto-generate summary/emotion/affirmation, detect habit completions.
- `GET /journal/:id` — fetch entry with completed habits.
- `PUT /journal/:id` — body `{ content }` → update entry, regenerate AI fields, re-run habit detection.
- `DELETE /journal/:id` — delete entry.
- `POST /journal/:id/habits/:habitId/toggle` — flip completion for an entry.

## Dashboard
- `GET /dashboard/:userId` — returns user details, stats, recent entries, emotion distribution, habit completions, weekly activity (last 30 days window).

### Notes
- All endpoints return JSON; `204` responses have no body.
- Validation errors return `{ error: string }`.
- There is no authentication; callers must supply a valid `userId`.
