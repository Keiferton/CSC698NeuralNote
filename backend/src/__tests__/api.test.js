const request = require('supertest');
const app = require('../app');

// Reset database for each test
beforeEach(() => {
  const db = require('../models/database');
  db.exec('DELETE FROM habit_completions');
  db.exec('DELETE FROM journal_entries');
  db.exec('DELETE FROM habits');
  db.exec('DELETE FROM users');
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
