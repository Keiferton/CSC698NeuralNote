const request = require('supertest');
const app = require('../app');

const db = require('../models/database');

// Reset database for each test
beforeEach(async () => {
  await db.query('TRUNCATE habit_completions, journal_entries, habits, users CASCADE');
});

afterAll(async () => {
  await db.close();
});

describe('Users API', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe('testuser');
    });

    it('should return existing user if username exists', async () => {
      const res1 = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });
      
      const res2 = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });
      
      expect(res1.body.id).toBe(res2.body.id);
    });

    it('should return 400 for missing username', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({});
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const createRes = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });
      
      const res = await request(app)
        .get(`/api/users/${createRes.body.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('testuser');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/non-existent-id');
      
      expect(res.status).toBe(404);
    });
  });
});

describe('Habits API', () => {
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'habituser' });
    userId = res.body.id;
  });

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise', description: 'Daily workout' });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Exercise');
      expect(res.body.description).toBe('Daily workout');
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ userId });
      
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({ userId: 'non-existent', name: 'Exercise' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/habits/user/:userId', () => {
    it('should return all habits for a user', async () => {
      await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise' });
      
      await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Reading' });
      
      const res = await request(app)
        .get(`/api/habits/user/${userId}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/habits/:id', () => {
    it('should update a habit', async () => {
      const createRes = await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise' });
      
      const res = await request(app)
        .put(`/api/habits/${createRes.body.id}`)
        .send({ name: 'Morning Exercise', description: 'Updated description' });
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Morning Exercise');
    });
  });

  describe('DELETE /api/habits/:id', () => {
    it('should delete a habit', async () => {
      const createRes = await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise' });
      
      const res = await request(app)
        .delete(`/api/habits/${createRes.body.id}`);
      
      expect(res.status).toBe(204);
      
      const getRes = await request(app)
        .get(`/api/habits/${createRes.body.id}`);
      
      expect(getRes.status).toBe(404);
    });
  });
});

describe('Journal API', () => {
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'journaluser' });
    userId = res.body.id;
  });

  describe('POST /api/journal', () => {
    it('should create a journal entry with AI analysis', async () => {
      const res = await request(app)
        .post('/api/journal')
        .send({ 
          userId, 
          content: 'Today was a wonderful day! I felt so happy and grateful.' 
        });
      
      expect(res.status).toBe(201);
      expect(res.body.content).toBeTruthy();
      expect(res.body.ai_summary).toBeTruthy();
      expect(res.body.ai_emotion).toBe('happy');
      expect(res.body.ai_affirmation).toBeTruthy();
    });

    it('should detect and record habit completions', async () => {
      // Create a habit first
      await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise' });
      
      const res = await request(app)
        .post('/api/journal')
        .send({ 
          userId, 
          content: 'I did my exercise routine this morning and felt great!' 
        });
      
      expect(res.status).toBe(201);
      expect(res.body.completedHabits).toHaveLength(1);
      expect(res.body.completedHabits[0].name).toBe('Exercise');
    });

    it('should return 400 for missing content', async () => {
      const res = await request(app)
        .post('/api/journal')
        .send({ userId });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/journal/user/:userId', () => {
    it('should return all journal entries for a user', async () => {
      await request(app)
        .post('/api/journal')
        .send({ userId, content: 'First entry' });
      
      await request(app)
        .post('/api/journal')
        .send({ userId, content: 'Second entry' });
      
      const res = await request(app)
        .get(`/api/journal/user/${userId}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/journal/:id', () => {
    it('should update a journal entry', async () => {
      const createRes = await request(app)
        .post('/api/journal')
        .send({ userId, content: 'Original content' });
      
      const res = await request(app)
        .put(`/api/journal/${createRes.body.id}`)
        .send({ content: 'Updated content with happy feelings!' });
      
      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated content with happy feelings!');
    });
  });

  describe('DELETE /api/journal/:id', () => {
    it('should delete a journal entry', async () => {
      const createRes = await request(app)
        .post('/api/journal')
        .send({ userId, content: 'Entry to delete' });
      
      const res = await request(app)
        .delete(`/api/journal/${createRes.body.id}`);
      
      expect(res.status).toBe(204);
    });
  });

  describe('POST /api/journal/:id/habits/:habitId/toggle', () => {
    it('should toggle habit completion', async () => {
      const habitRes = await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Reading' });
      
      const entryRes = await request(app)
        .post('/api/journal')
        .send({ userId, content: 'Just a regular day' });
      
      // Toggle on
      const toggleOnRes = await request(app)
        .post(`/api/journal/${entryRes.body.id}/habits/${habitRes.body.id}/toggle`);
      
      expect(toggleOnRes.body.completed).toBe(true);
      
      // Toggle off
      const toggleOffRes = await request(app)
        .post(`/api/journal/${entryRes.body.id}/habits/${habitRes.body.id}/toggle`);
      
      expect(toggleOffRes.body.completed).toBe(false);
    });
  });
});

describe('Dashboard API', () => {
  let userId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'dashboarduser' });
    userId = res.body.id;
  });

  describe('GET /api/dashboard/:userId', () => {
    it('should return dashboard data', async () => {
      // Create some data
      await request(app)
        .post('/api/habits')
        .send({ userId, name: 'Exercise' });
      
      await request(app)
        .post('/api/journal')
        .send({ userId, content: 'Happy day with exercise!' });
      
      const res = await request(app)
        .get(`/api/dashboard/${userId}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('stats');
      expect(res.body).toHaveProperty('recentEntries');
      expect(res.body).toHaveProperty('emotionDistribution');
      expect(res.body).toHaveProperty('habitCompletions');
      expect(res.body).toHaveProperty('weeklyActivity');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/dashboard/non-existent-id');
      
      expect(res.status).toBe(404);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Debug Stats API', () => {
  // Helper function to temporarily set environment variables
  const withEnvVars = (envVars, testFn) => {
    return async () => {
      const originalValues = {};
      
      // Save original values and set new ones
      for (const [key, value] of Object.entries(envVars)) {
        originalValues[key] = process.env[key];
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      
      try {
        await testFn();
      } finally {
        // Restore original values
        for (const [key, originalValue] of Object.entries(originalValues)) {
          if (originalValue === undefined) {
            delete process.env[key];
          } else {
            process.env[key] = originalValue;
          }
        }
      }
    };
  };

  describe('GET /api/debug/stats', () => {
    it('should return correct AI configuration information', async () => {
      const res = await request(app).get('/api/debug/stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ai');
      expect(res.body.ai).toHaveProperty('provider');
      expect(res.body.ai).toHaveProperty('hasApiKey');
      expect(res.body.ai).toHaveProperty('apiKeyPreview');
      expect(res.body.ai).toHaveProperty('models');
      expect(res.body.ai.models).toHaveProperty('summarization');
      expect(res.body.ai.models).toHaveProperty('affirmation');
      expect(res.body.ai.models.summarization).toBe('facebook/bart-large-cnn');
      expect(res.body.ai.models.affirmation).toBe('mistralai/Mistral-7B-Instruct-v0.1');
    });

    it('should return environment information', async () => {
      const res = await request(app).get('/api/debug/stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('environment');
      expect(res.body.environment).toHaveProperty('nodeEnv');
      expect(res.body.environment).toHaveProperty('port');
      expect(res.body.environment).toHaveProperty('corsEnabled');
      expect(res.body.environment.corsEnabled).toBe(true);
    });

    it('should return timestamp and uptime', async () => {
      const res = await request(app).get('/api/debug/stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('should properly mask API key when set', withEnvVars(
      { HUGGINGFACE_API_KEY: 'hf_testkey1234567890abcdef' },
      async () => {
        const res = await request(app).get('/api/debug/stats');
        
        expect(res.status).toBe(200);
        expect(res.body.ai.hasApiKey).toBe(true);
        expect(res.body.ai.apiKeyPreview).toBe('hf_testkey...');
        expect(res.body.ai.apiKeyPreview).not.toContain('1234567890abcdef');
      }
    ));

    it('should handle missing API key', withEnvVars(
      { HUGGINGFACE_API_KEY: undefined },
      async () => {
        const res = await request(app).get('/api/debug/stats');
        
        expect(res.status).toBe(200);
        expect(res.body.ai.hasApiKey).toBe(false);
        expect(res.body.ai.apiKeyPreview).toBe('Not set');
      }
    ));

    it('should show Hugging Face provider when USE_HUGGINGFACE is true', withEnvVars(
      { USE_HUGGINGFACE: 'true' },
      async () => {
        const res = await request(app).get('/api/debug/stats');
        
        expect(res.status).toBe(200);
        expect(res.body.ai.provider).toBe('Hugging Face');
      }
    ));

    it('should show Local (Mock) provider when USE_HUGGINGFACE is not true', withEnvVars(
      { USE_HUGGINGFACE: 'false' },
      async () => {
        const res = await request(app).get('/api/debug/stats');
        
        expect(res.status).toBe(200);
        expect(res.body.ai.provider).toBe('Local (Mock)');
      }
    ));
  });
});
