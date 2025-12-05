const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usersRoutes = require('./routes/users');
const habitsRoutes = require('./routes/habits');
const journalRoutes = require('./routes/journal');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug stats endpoint
app.get('/api/debug/stats', (req, res) => {
  res.json({
    ai: {
      provider: process.env.USE_HUGGINGFACE === 'true' ? 'Hugging Face' : 'Local (Mock)',
      hasApiKey: !!process.env.HUGGINGFACE_API_KEY,
      apiKeyPreview: process.env.HUGGINGFACE_API_KEY ? 
        process.env.HUGGINGFACE_API_KEY.substring(0, 10) + '...' : 'Not set',
      models: {
        summarization: 'facebook/bart-large-cnn',
        affirmation: 'mistralai/Mistral-7B-Instruct-v0.1'
      }
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      corsEnabled: true
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
