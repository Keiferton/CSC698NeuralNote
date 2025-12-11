# NeuralNote – Groq AI Setup Guide

## Overview
NeuralNote uses **Groq API** for fast, high-quality AI inference. Groq provides the llama-3.1-8b-instant model for:
- Emotion detection from journal text
- Smart journal entry summaries
- Personalized affirmations based on mood
- Automatic habit detection

Groq's free tier offers excellent performance (typically 200-500ms per request) with no credit card required.

## Step 1: Get a Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign up with your email or GitHub account
3. Create a new API key (give it a name like "neuralnote")
4. Copy the key (starts with `gsk_`)
5. Keep it safe — don't commit it to Git

## Step 2: Create a `.env` File in `/backend`

Create `backend/.env` with:

```
# Groq AI Configuration
GROQ_API_KEY=gsk_YOUR_KEY_HERE
AI_PROVIDER=groq

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:port/database
```

**Replace:**
- `gsk_YOUR_KEY_HERE` with your actual Groq API key
- `DATABASE_URL` with your Supabase PostgreSQL connection string

> **⚠️ Important**: `.env` is in `.gitignore` — do NOT commit it to Git

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

The following are already in `package.json`:
- `groq-sdk` - Groq API client
- `dotenv` - Environment variable loader
- `pg` - PostgreSQL client
- `express` - REST API framework

## Step 4: Start the Server

```bash
npm start
```

The server should start on `http://localhost:3001`

## Step 5: Test the Integration

1. Start the frontend in another terminal:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Navigate to http://localhost:3000

3. Create a user account (no password needed)

4. Create a journal entry with some text about your day

5. You should see:
   - ✅ Emotion detected (happy, sad, anxious, etc.)
   - ✅ AI-generated summary of your entry
   - ✅ Personalized affirmation
   - ✅ Any mentioned habits auto-detected

## How It Works

### AI Processing
When you create a journal entry, NeuralNote:

1. **Emotion Detection** - Sends text to Groq with a system prompt to identify primary emotion
2. **Summarization** - Generates a concise summary using Groq's Llama 3.1 model
3. **Affirmation** - Creates personalized motivation based on detected emotion
4. **Habit Detection** - Uses local keyword matching to find mentioned habits

All responses are cached in PostgreSQL for later viewing.

### Fallback Mode
If Groq API is unavailable:
- ✅ Emotion detection still works (local keyword-based)
- ✅ Summaries use local generation (key phrase extraction)
- ✅ Affirmations from predefined list
- ✅ App continues to function normally

This is controlled by the `AI_PROVIDER` environment variable:
```
AI_PROVIDER=groq    # Use Groq API (default)
AI_PROVIDER=local   # Force local processing (no API calls)
```

## Troubleshooting

### "GROQ_API_KEY is missing or empty"
- ✅ Check that `backend/.env` exists
- ✅ Verify the key is correct (`gsk_...`)
- ✅ Make sure you're in the `/backend` directory
- ✅ Restart the server after adding `.env`

### API timeouts or slow responses
- ✅ Check your internet connection
- ✅ Groq free tier is rate-limited; wait a moment between requests
- ✅ The app will automatically fall back to local processing

### Journal entry shows "error" in AI fields
- ✅ Check the backend console for error messages
- ✅ The app should have fallen back to local generation
- ✅ Verify your API key is valid at https://console.groq.com/keys

### Database connection errors
- ✅ Ensure `DATABASE_URL` is set correctly in `.env`
- ✅ Test the connection with: `psql $DATABASE_URL`
- ✅ For Supabase, find your connection string in Project Settings > Database

## Key Files

- `backend/src/services/aiService.js` - Groq API integration, emotion detection, summarization
- `backend/src/routes/journal.js` - Journal API endpoints
- `backend/src/server.js` - Loads `.env` and starts Express server
- `frontend/src/components/DebugPanel.js` - Shows AI provider status
- `backend/.env` - Configuration (not in Git)

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GROQ_API_KEY` | Groq API authentication | `gsk_...` |
| `AI_PROVIDER` | Which AI to use | `groq` or `local` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `NODE_ENV` | Environment | `production`, `test`, `development` |
| `PORT` | Server port | `3001` (default) |

## Learn More

- **Groq Docs**: https://console.groq.com/docs
- **Available Models**: https://console.groq.com/docs/models
- **Rate Limits**: Free tier gets ~30 requests/min
- **Architecture**: See `docs/architecture.md`
- **API Endpoints**: See `docs/api.md`
