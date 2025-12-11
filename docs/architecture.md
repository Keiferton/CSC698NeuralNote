# Architecture

## Stack
- **Frontend**: React 19 (Create React App), local state via hooks, REST calls via `src/services/api.js`
- **Backend**: Express.js + PostgreSQL (pg pool, async), service-based architecture with AI integration
- **AI Provider**: Groq API (llama-3.1-8b-instant model) with local fallback
- **Storage**: Supabase PostgreSQL (set `DATABASE_URL`); same DB used in tests unless you point to a separate instance
- **Testing**: Jest + Supertest for backend routes, AI service mocking for fast tests

## Runtime Flow
1) **User Setup**: User creates/recalls a username (no auth) → frontend stores `neuralnote_user_id` in `localStorage`
2) **Journal Entry**: User writes a journal entry → backend sends to Groq API for:
   - Emotion detection (identifies mood from text)
   - Summary generation (creates concise reflection)
   - Affirmation generation (personalized motivation)
   - Habit detection (auto-detects mentioned habits)
3) **Data Persistence**: All results stored in PostgreSQL via model classes
4) **Dashboard**: Aggregates entries and habit completions to show trends and statistics
5) **Graceful Degradation**: If Groq API unavailable, falls back to local keyword-based processing

## Local development
- Backend: `cd backend && npm install && npm start` (starts on `http://localhost:3001`).
- Frontend: `cd frontend && npm install && npm start` (proxy calls to backend via `REACT_APP_API_URL` or default to `http://localhost:3001/api`).

## Testing
- **Backend AI Service**: `npm test -- __tests__/aiService.test.js` - 34 tests covering emotion detection, summaries, affirmations, edge cases (mocked Groq)
- **Backend API**: `npm test -- __tests__/api.test.js` - 28 tests for all REST endpoints and debug stats
- **Backend Integration**: `npm test -- __tests__/integration.test.js` - End-to-end user workflows
- **Frontend**: CRA `npm test` (minimal coverage, component rendering tests)
- **Coverage**: AI service 69.33%, API routes 75%+

Run all tests: `cd backend && npm test`
