# 🧠 NeuralNote

AI-assisted journaling and habit tracking app that helps users reflect more effectively through intelligent analysis and gentle affirmations.

## Features

- 📝 **Daily Journaling** - Write daily journal entries with a clean, intuitive interface
- 🤖 **AI Reflections** - Get automatic summaries, emotion detection, and personalized affirmations
- ✅ **Smart Habit Tracking** - Automatically detects completed habits mentioned in your journal entries
- 📊 **Progress Dashboard** - Visualize your journaling streak, emotion patterns, and habit completions

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: SQLite (via better-sqlite3)
- **AI Service**: Rule-based emotion detection and habit matching (extensible to real AI APIs)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Keiferton/CSC698NeuralNote.git
cd CSC698NeuralNote
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The API server will run on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The app will open at http://localhost:3000

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Users
- `POST /api/users` - Create or get a user
- `GET /api/users/:id` - Get user by ID

### Habits
- `GET /api/habits/user/:userId` - Get all habits for a user
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit

### Journal Entries
- `GET /api/journal/user/:userId` - Get all journal entries for a user
- `POST /api/journal` - Create a new entry (with AI analysis)
- `PUT /api/journal/:id` - Update an entry
- `DELETE /api/journal/:id` - Delete an entry
- `POST /api/journal/:id/habits/:habitId/toggle` - Toggle habit completion

### Dashboard
- `GET /api/dashboard/:userId` - Get dashboard data with stats and visualizations

## Project Structure

```
CSC698NeuralNote/
├── backend/
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # AI and business logic
│   │   ├── __tests__/    # Backend tests
│   │   ├── app.js        # Express app
│   │   └── server.js     # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service
│   │   ├── App.js        # Main app component
│   │   └── App.css       # Global styles
│   └── package.json
└── README.md
```

## License

ISC

