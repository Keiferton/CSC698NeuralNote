# NeuralNote

AI-assisted journaling and habit tracking. The backend is a small Express + Postgres API; the frontend is a React SPA that calls it via REST.

## What’s here (MVP)
- Express API with rule-based “AI” for summaries/emotion/affirmations and habit detection.
- Postgres storage (Supabase) via `pg`.
- React client with tabs for Journal, Habits, and Dashboard.
- Jest + Supertest coverage for the backend routes and AI helpers.

## Quick start
1) Backend  
```
cd backend
npm install
npm start   # http://localhost:3001
```

2) Frontend (new terminal)  
```
cd frontend
npm install
npm start   # http://localhost:3000
```

Optional env: set `REACT_APP_API_URL` to point the frontend at a non-default API base (defaults to `http://localhost:3001/api`).

## Proposed MVP folder layout
```
CSC698NeuralNote/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/       # users, habits, journal, dashboard, helpers
│   │   ├── models/       # User, Habit, JournalEntry, HabitCompletion, database
│   │   ├── services/     # aiService
│   │   └── __tests__/    # jest + supertest suites
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Dashboard, HabitManager, JournalEntry, LoginForm
│   │   ├── hooks/        # useData
│   │   ├── services/     # api client
│   │   └── App.js/App.css etc.
│   └── package.json
└── docs/                 # architecture.md, api.md, data-models.md
```

## Data model (Postgres)
- `users`: `id`, `username`, `created_at`
- `habits`: `id`, `user_id`, `name`, `description`, `created_at`
- `journal_entries`: `id`, `user_id`, `content`, `ai_summary`, `ai_emotion`, `ai_affirmation`, `created_at`
- `habit_completions`: `id`, `habit_id`, `journal_entry_id`, `completed_at` (unique on habit+entry)

Details live in `docs/data-models.md`.

## API overview
Base URL `http://localhost:3001/api`
- Users: `POST /users`, `GET /users/:id`
- Habits: `GET /habits/user/:userId`, `POST /habits`, `GET/PUT/DELETE /habits/:id`, completions window at `/habits/user/:userId/completions`
- Journal: `GET /journal/user/:userId`, `POST /journal`, `GET/PUT/DELETE /journal/:id`, toggle completion `/journal/:id/habits/:habitId/toggle`
- Dashboard: `GET /dashboard/:userId`

More request/response detail is in `docs/api.md`.

## Testing
- Backend: `cd backend && npm test` (runs against the configured Postgres database).
- Frontend: `cd frontend && npm test` (CRA defaults; currently minimal).

## Docs
- `docs/architecture.md` — stack and runtime flow.
- `docs/api.md` — REST endpoints.
- `docs/data-models.md` — schema and relationships.
