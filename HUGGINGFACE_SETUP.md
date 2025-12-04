# Hugging Face AI Integration Setup Guide

## Overview
NeuralNote now uses Hugging Face Inference API for intelligent journal analysis. The system generates:
- Smart summaries of journal entries
- AI-powered affirmations based on detected emotions
- Emotion detection (local, no API needed)
- Habit completion detection (local, no API needed)

## Setup Instructions

### Step 1: Get a Hugging Face API Key
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (name it something like "neuralnote")
3. Select "Read" access level (that's all that's needed)
4. Copy your token

### Step 2: Create `.env` file in `/backend`
In the `backend/` directory, create a `.env` file with:

```
HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
USE_HUGGINGFACE=true
```

Replace `hf_YOUR_TOKEN_HERE` with your actual token.

### Step 3: Install Dependencies
```bash
cd backend
npm install
```

The following are already in `package.json`:
- `@huggingface/inference` - Hugging Face API client
- `dotenv` - Environment variable loader

### Step 4: Test the Integration
```bash
npm start
```

Then create a journal entry via the API. You should see:
- Fast emotion detection (local)
- AI-generated summary (from Hugging Face)
- AI-generated affirmation (from Hugging Face)

### Step 5: Monitor Costs (Free Tier)
- Free tier: ~33,000 tokens per month
- Each journal entry uses ~50-100 tokens
- That's roughly 300-600 entries per month on free tier
- No credit card required for free tier

## Troubleshooting

### "API key not found" error
- Make sure `.env` file exists in `/backend` (not root)
- Make sure `USE_HUGGINGFACE=true` is set
- Restart the server after creating `.env`

### Fallback to Local Mode
If the API fails (rate limit, invalid key, etc.):
- System automatically falls back to local generation
- Emotion detection still works
- Affirmations come from predefined list
- Check the console logs for error details

### If You Don't Want to Use Hugging Face
Set in `.env`:
```
USE_HUGGINGFACE=false
```

This uses the original mock implementation (works offline, no API key needed).

## What Changed in the Code

**Files Modified:**
- `backend/src/services/aiService.js` - Now calls Hugging Face API with fallback
- `backend/src/routes/journal.js` - Routes now handle async AI calls
- `backend/src/server.js` - Loads `.env` file on startup

**Key Functions:**
- `generateReflection()` - Now async, calls Hugging Face
- `generateSummary()` - Calls Hugging Face for summaries
- `generateAffirmation()` - Calls Hugging Face for affirmations

## Team Workflow

**For each team member:**
1. Pull the latest code
2. Create their own `.env` file with their Hugging Face API key
3. Run `npm install` in backend (if dependencies changed)
4. Run `npm start`
5. Test by creating a journal entry

**Don't commit `.env` to Git** - it's already in `.gitignore`

## Model Used

- **Model:** `mistralai/Mistral-7B-Instruct-v0.1`
- **Why:** Fast, high quality, free on Hugging Face Inference API
- **Speed:** ~5-15 seconds per request (first time), faster after

## Next Steps

If you want to:
- **Upgrade to faster responses:** Use a smaller model or Hugging Face Pro
- **Switch to OpenAI:** Replace the Hugging Face calls with OpenAI SDK
- **Use local AI:** Use Ollama instead (no API key needed)
- **Customize responses:** Edit the prompts in `aiService.js`

