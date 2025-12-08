# NeuralNote – Hugging Face Setup Guide
## 1. Get a Hugging Face API Key

- Go to: https://huggingface.co/settings/tokens

- Create a new token (e.g., neuralnote)

- Set access to Read

- Copy the token

## 2. Create a `.env` File (inside `/backend`)

- Create a file at `backend/.env` with:

```
HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
USE_HUGGINGFACE=true
```

- Replace `hf_YOUR_TOKEN_HERE` with your actual key.

  > Note: `.env` is ignored by Git — do not commit it.

## 3. Install Dependencies

- Run:
```
cd backend
npm install
```
## 4. Start the Server and Test
```
npm start
```

Create any journal entry and you should see:

- Emotion detection

- AI-generated summary

- AI-generated affirmation

## 5. Common Issues
### API key not found

Check:

- `.env` is inside /backend

- Your key is correct

- `USE_HUGGINGFACE=true`

- Restart the server after editing `.env`

### API failure

If Hugging Face is unavailable:

- The app automatically uses local fallback responses

- Check the backend console for details

## 6. Relevant Files (FYI)

- `aiService.js` – Hugging Face API calls

- `journal.js` – routes handling AI

- `server.js` – loads `.env`
