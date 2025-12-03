const express = require('express');
const router = express.Router();
const db = require('../models/database');

/**
 * Get application-wide statistics
 * Useful for monitoring and understanding user engagement
 */
router.get('/', (req, res) => {
  try {
    // Get total users
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const usersResult = usersStmt.all();
    const totalUsers = usersResult[0]?.count || 0;

    // Get total journal entries
    const entriesStmt = db.prepare('SELECT COUNT(*) as count FROM journal_entries');
    const entriesResult = entriesStmt.all();
    const totalEntries = entriesResult[0]?.count || 0;

    // Get total habits
    const habitsStmt = db.prepare('SELECT COUNT(*) as count FROM habits');
    const habitsResult = habitsStmt.all();
    const totalHabits = habitsResult[0]?.count || 0;

    // Get total habit completions
    const completionsStmt = db.prepare('SELECT COUNT(*) as count FROM habit_completions');
    const completionsResult = completionsStmt.all();
    const totalCompletions = completionsResult[0]?.count || 0;

    // Get entries in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentEntriesStmt = db.prepare(
      'SELECT COUNT(*) as count FROM journal_entries WHERE created_at > ?'
    );
    const recentEntriesResult = recentEntriesStmt.all(sevenDaysAgo);
    const entriesLastWeek = recentEntriesResult[0]?.count || 0;

    // Get emotion breakdown
    const emotionStmt = db.prepare(
      'SELECT ai_emotion, COUNT(*) as count FROM journal_entries WHERE ai_emotion IS NOT NULL GROUP BY ai_emotion'
    );
    const emotionResults = emotionStmt.all();
    const emotionDistribution = {};
    emotionResults.forEach(row => {
      emotionDistribution[row.ai_emotion] = row.count;
    });

    // Get average habits per user
    const avgHabitsStmt = db.prepare(
      'SELECT AVG(habit_count) as avg FROM (SELECT user_id, COUNT(*) as habit_count FROM habits GROUP BY user_id)'
    );
    const avgHabitsResult = avgHabitsStmt.all();
    const avgHabitsPerUser = avgHabitsResult[0]?.avg || 0;

    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalUsers,
        totalEntries,
        totalHabits,
        totalCompletions,
        entriesLastWeek
      },
      insights: {
        avgHabitsPerUser: Math.round(avgHabitsPerUser * 100) / 100,
        emotionDistribution,
        avgEntriesPerUser: totalUsers > 0 ? Math.round((totalEntries / totalUsers) * 100) / 100 : 0,
        completionRate: totalHabits > 0 ? Math.round((totalCompletions / totalHabits) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
