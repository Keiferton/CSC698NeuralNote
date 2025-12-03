const request = require('supertest');
const app = require('../app');

/**
 * Integration test: Tests the full user flow from registration to journaling
 * This validates that all components work together correctly
 */
describe('Full User Flow Integration Test', () => {
  let userId;
  let habitId;
  let journalEntryId;

  // Clean up after all tests
  afterAll(() => {
    const db = require('../models/database');
    db.exec('DELETE FROM habit_completions');
    db.exec('DELETE FROM journal_entries');
    db.exec('DELETE FROM habits');
    db.exec('DELETE FROM users');
  });

  it('should complete full user journey: create user -> create habit -> create journal -> toggle habit -> view dashboard', async () => {
    // Step 1: Create a user
    const userRes = await request(app)
      .post('/api/users')
      .send({ username: 'integration-test-user' });
    
    expect(userRes.status).toBe(201);
    expect(userRes.body).toHaveProperty('id');
    expect(userRes.body.username).toBe('integration-test-user');
    userId = userRes.body.id;

    // Step 2: Create a habit
    const habitRes = await request(app)
      .post('/api/habits')
      .send({ 
        userId, 
        name: 'Daily Exercise', 
        description: '30 minutes of physical activity' 
      });
    
    expect(habitRes.status).toBe(201);
    expect(habitRes.body).toHaveProperty('id');
    expect(habitRes.body.name).toBe('Daily Exercise');
    habitId = habitRes.body.id;

    // Step 3: Verify habit appears in user's habits list
    const habitsListRes = await request(app)
      .get(`/api/habits/user/${userId}`);
    
    expect(habitsListRes.status).toBe(200);
    expect(habitsListRes.body).toHaveLength(1);
    expect(habitsListRes.body[0].id).toBe(habitId);

    // Step 4: Create a journal entry (should auto-detect habit completion)
    const journalRes = await request(app)
      .post('/api/journal')
      .send({ 
        userId, 
        content: 'Today I did my daily exercise routine and felt amazing!' 
      });
    
    expect(journalRes.status).toBe(201);
    expect(journalRes.body).toHaveProperty('id');
    expect(journalRes.body.content).toContain('exercise');
    expect(journalRes.body).toHaveProperty('ai_summary');
    expect(journalRes.body).toHaveProperty('ai_emotion');
    expect(journalRes.body).toHaveProperty('ai_affirmation');
    journalEntryId = journalRes.body.id;

    // Step 5: Verify journal entry appears in user's journal list
    const journalListRes = await request(app)
      .get(`/api/journal/user/${userId}`);
    
    expect(journalListRes.status).toBe(200);
    expect(journalListRes.body).toHaveLength(1);
    expect(journalListRes.body[0].id).toBe(journalEntryId);

    // Step 6: Toggle habit completion manually
    const toggleRes = await request(app)
      .post(`/api/journal/${journalEntryId}/habits/${habitId}/toggle`);
    
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body).toHaveProperty('completed');

    // Step 7: View dashboard and verify all data is present
    const dashboardRes = await request(app)
      .get(`/api/dashboard/${userId}`);
    
    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body).toHaveProperty('user');
    expect(dashboardRes.body.user.id).toBe(userId);
    expect(dashboardRes.body).toHaveProperty('stats');
    expect(dashboardRes.body.stats.totalEntries).toBe(1);
    expect(dashboardRes.body.stats.totalHabits).toBe(1);
    expect(dashboardRes.body).toHaveProperty('recentEntries');
    expect(dashboardRes.body.recentEntries).toHaveLength(1);
    expect(dashboardRes.body).toHaveProperty('emotionDistribution');
    expect(dashboardRes.body).toHaveProperty('habitCompletions');
    expect(dashboardRes.body).toHaveProperty('weeklyActivity');
  });

  it('should handle error cases gracefully', async () => {
    // Test invalid user ID
    const invalidUserRes = await request(app)
      .get('/api/dashboard/invalid-user-id');
    
    expect(invalidUserRes.status).toBe(404);

    // Test missing required fields
    const missingFieldRes = await request(app)
      .post('/api/habits')
      .send({ userId: 'some-id' }); // Missing name
    
    expect(missingFieldRes.status).toBe(400);

    // Test non-existent endpoint
    const notFoundRes = await request(app)
      .get('/api/nonexistent');
    
    expect(notFoundRes.status).toBe(404);
  });

  it('should maintain data consistency across operations', async () => {
    // Create a second user to ensure isolation
    const user2Res = await request(app)
      .post('/api/users')
      .send({ username: 'integration-test-user-2' });
    
    const userId2 = user2Res.body.id;

    // Create habit for user 2
    const habit2Res = await request(app)
      .post('/api/habits')
      .send({ userId: userId2, name: 'Reading' });
    
    // Verify user 1's habits are not affected
    const user1HabitsRes = await request(app)
      .get(`/api/habits/user/${userId}`);
    
    expect(user1HabitsRes.body).toHaveLength(1);
    expect(user1HabitsRes.body[0].name).toBe('Daily Exercise');

    // Verify user 2's habits are separate
    const user2HabitsRes = await request(app)
      .get(`/api/habits/user/${userId2}`);
    
    expect(user2HabitsRes.body).toHaveLength(1);
    expect(user2HabitsRes.body[0].name).toBe('Reading');
  });
});

