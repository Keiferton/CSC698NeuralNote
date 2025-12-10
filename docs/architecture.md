# Architecture

## Stack
- Frontend: React (Create React App), local state via hooks, REST calls via `src/services/api.js`.
- Backend: Express + Postgres (pg pool, async), simple model classes, Jest + Supertest for API tests.
- Storage: Supabase Postgres (set `DATABASE_URL`); same DB used in tests unless you point to a separate instance.

## Runtime flow
1) User creates/recalls a username (no auth) → frontend stores `neuralnote_user_id` in `localStorage`.
2) Frontend calls the backend API (`/api/users`, `/api/habits`, `/api/journal`, `/api/dashboard`) to mutate/read state.
3) Backend persists data via model classes that wrap SQL queries.
4) The dashboard endpoint aggregates journal entries and habit completions to produce simple stats.

## Local development
- Backend: `cd backend && npm install && npm start` (starts on `http://localhost:3001`).
- Frontend: `cd frontend && npm install && npm start` (proxy calls to backend via `REACT_APP_API_URL` or default to `http://localhost:3001/api`).

## Testing
- Backend: `cd backend && npm test` uses Jest + Supertest against the configured Postgres database (set `DATABASE_URL` to a test DB if needed).
- Frontend: CRA `npm test` is available but currently minimal.
