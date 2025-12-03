const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const Habit = require('../models/Habit');
const { getUserOr404 } = require('./helpers');

// Get dashboard data for a user
router.get('/:userId', (req, res) => {
  try {
    const user = getUserOr404(req.params.userId, res);
    if (!user) return;
    
    // Get date range for the dashboard (default: last 30 days)
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get recent journal entries (last 5)
    const recentEntries = JournalEntry.findByUserId(req.params.userId, 5, 0);
    
    // Get all entries for the date range
    const allEntries = JournalEntry.getByDateRange(req.params.userId, startDate, endDate);
    
    // Get habit completions for the date range
    const habitCompletions = Habit.getCompletionsByDateRange(req.params.userId, startDate, endDate);
    
    // Get total habits count
    const allHabits = Habit.findByUserId(req.params.userId);
    const totalHabits = allHabits.length;
    
    // Calculate emotion distribution
    const emotionDistribution = {};
    for (const entry of allEntries) {
      if (entry.ai_emotion) {
        emotionDistribution[entry.ai_emotion] = (emotionDistribution[entry.ai_emotion] || 0) + 1;
      }
    }
    
    // Calculate journaling streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date descending
    const sortedEntries = [...allEntries].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    // Get unique dates
    const uniqueDates = new Set();
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      uniqueDates.add(entryDate.toISOString().split('T')[0]);
    }
    
    // Calculate streak
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates.includes(expectedDateStr)) {
        currentStreak++;
      } else if (i === 0) {
        // Check if we journaled yesterday (streak can continue)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (sortedDates.includes(yesterdayStr)) {
          currentStreak = 1;
          continue;
        }
        break;
      } else {
        break;
      }
    }
    
    // Build weekly activity (entries per day for the last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entriesOnDay = allEntries.filter(entry => {
        const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
        return entryDate === dateStr;
      });
      
      weeklyActivity.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        entryCount: entriesOnDay.length
      });
    }
    
    res.json({
      user,
      stats: {
        totalEntries: allEntries.length,
        totalHabits,
        currentStreak,
        habitCompletionRate: habitCompletions.length > 0 
          ? habitCompletions.reduce((sum, h) => sum + h.completion_count, 0) / habitCompletions.length 
          : 0
      },
      recentEntries: recentEntries.map(entry => ({
        ...entry,
        completedHabits: JournalEntry.getCompletedHabits(entry.id)
      })),
      emotionDistribution,
      habitCompletions,
      weeklyActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
