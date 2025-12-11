# NeuralNote

AI-assisted journaling and habit tracking powered by Groq API. The backend is an Express + PostgreSQL REST API; the frontend is a React SPA with intelligent mood tracking, habit linking, and personalized affirmations.

## Tech Stack

**Backend:**
- Node.js + Express.js (REST API)
- PostgreSQL via Supabase (`pg` pool)
- **Groq API** for fast AI inference (Llama 3.1 8B Instant model)
- Jest + Supertest for comprehensive testing

**Frontend:**
- React 19 with Hooks
- CSS (component-scoped)
- Fetch API for HTTP

## Features
- 🧠 **Groq-powered AI** - Fast emotion detection, journal summaries, and personalized affirmations
- 📝 **Smart Journaling** - Automatic emotion and habit detection from entries
- ✅ **Habit Tracking** - Link habits to journal entries and track completion patterns
- 📊 **Dashboard** - View mood trends and habit statistics
- 🔄 **Graceful Fallback** - Local generation when API unavailable

## What's here (MVP)
- Express API with Groq AI integration for summaries/emotion/affirmations and habit detection.
- Postgres storage (Supabase) via `pg`.
- React client with tabs for Journal, Habits, and Dashboard.
- Jest + Supertest coverage for the backend routes and AI helpers.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL or Supabase account
- Groq API key (free at https://console.groq.com/keys)

### Setup

1) **Backend**
```bash
cd backend
npm install

# Create .env file with:
# GROQ_API_KEY=gsk_YOUR_KEY
# AI_PROVIDER=groq
# DATABASE_URL=postgresql://...

npm start   # Runs on http://localhost:3001
```

2) **Frontend** (new terminal)
```bash
cd frontend
npm install
npm start   # Runs on http://localhost:3000
```

3) **Create a Journal Entry**
- Go to http://localhost:3000
- Create a username
- Write a journal entry
- Watch the AI generate emotion, summary, and affirmation in real-time!

### Environment Variables
- `GROQ_API_KEY` - Your Groq API key (required for AI features)
- `AI_PROVIDER` - Set to `groq` for API or `local` for offline mode
- `DATABASE_URL` - PostgreSQL connection string
- `REACT_APP_API_URL` - Frontend API endpoint (defaults to `http://localhost:3001/api`)

See `GROQ_SETUP.md` for detailed configuration.

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

## Documentation

- **[GROQ_SETUP.md](./GROQ_SETUP.md)** - How to set up and configure Groq API integration
- **[docs/architecture.md](./docs/architecture.md)** - System design and AI workflow
- **[docs/api.md](./docs/api.md)** - Complete REST API reference
- **[docs/data-models.md](./docs/data-models.md)** - Database schema and relationships

## Testing

Run all backend tests:
```bash
cd backend
npm test
```

Tests include:
- **AI Service** (34 tests) - Emotion detection, summarization, affirmations
- **API Routes** (28 tests) - All REST endpoints and error handling
- **Integration** - End-to-end user workflows
- **Coverage**: 69.33% AI service, 75%+ API routes

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
