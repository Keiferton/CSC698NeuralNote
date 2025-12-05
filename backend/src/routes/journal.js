const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const aiService = require('../services/aiService');
const { requireString, getUserOr404, getHabitOr404 } = require('./helpers');

// Get all journal entries for a user
router.get('/user/:userId', (req, res) => {
  try {
    const user = getUserOr404(req.params.userId, res);
    if (!user) return;

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const entries = JournalEntry.findByUserId(req.params.userId, limit, offset);
    
    // Add completed habits to each entry
    const entriesWithHabits = entries.map(entry => ({
      ...entry,
      completedHabits: JournalEntry.getCompletedHabits(entry.id)
    }));
    
    res.json(entriesWithHabits);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Create a new journal entry with AI analysis
router.post('/', async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const entryContent = requireString(content, 'Journal entry content is required', res);
    if (!entryContent) return;

    const user = getUserOr404(userId, res);
    if (!user) return;

    // Get user's habits for detection
    const userHabits = Habit.findByUserId(userId);
    
    // Generate AI reflection (now async)
    const reflection = await aiService.generateReflection(entryContent, userHabits);
    
    // Create the journal entry
    const entry = JournalEntry.create(
      userId,
      entryContent,
      reflection.summary,
      reflection.emotion,
      reflection.affirmation
    );
    
    // Record habit completions
    const completedHabits = [];
    for (const habitId of reflection.detectedHabits) {
      const completion = HabitCompletion.create(habitId, entry.id);
      if (completion) {
        const habit = Habit.findById(habitId);
        completedHabits.push(habit);
      }
    }
    
    res.status(201).json({
      ...entry,
      completedHabits
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Get a specific journal entry
router.get('/:id', (req, res) => {
  try {
    const entry = JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const completedHabits = JournalEntry.getCompletedHabits(entry.id);
    
    res.json({
      ...entry,
      completedHabits
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Update a journal entry
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;

    const entryContent = requireString(content, 'Journal entry content is required', res);
    if (!entryContent) return;

    const existingEntry = JournalEntry.findById(req.params.id);
    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Get user's habits for detection
    const userHabits = Habit.findByUserId(existingEntry.user_id);
    
    // Regenerate AI reflection with updated content (now async)
    const reflection = await aiService.generateReflection(entryContent, userHabits);
    
    // Update the entry
    const entry = JournalEntry.update(
      req.params.id,
      entryContent,
      reflection.summary,
      reflection.emotion,
      reflection.affirmation
    );
    
    // Update habit completions - remove old completions
    const oldCompletions = HabitCompletion.findByJournalEntry(req.params.id);
    for (const completion of oldCompletions) {
      HabitCompletion.delete(completion.id);
    }
    
    // Add new completions
    const completedHabits = [];
    for (const habitId of reflection.detectedHabits) {
      const completion = HabitCompletion.create(habitId, entry.id);
      if (completion) {
        const habit = Habit.findById(habitId);
        completedHabits.push(habit);
      }
    }
    
    res.json({
      ...entry,
      completedHabits
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete a journal entry
router.delete('/:id', (req, res) => {
  try {
    const entry = JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    JournalEntry.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// Toggle habit completion for an entry
router.post('/:id/habits/:habitId/toggle', (req, res) => {
  try {
    const entry = JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const habit = getHabitOr404(req.params.habitId, res);
    if (!habit) return;
    
    // Check if completion exists
    const existingCompletion = HabitCompletion.findByHabitAndEntry(
      req.params.habitId,
      req.params.id
    );
    
    if (existingCompletion) {
      // Remove completion
      HabitCompletion.delete(existingCompletion.id);
      res.json({ completed: false, habit });
    } else {
      // Add completion
      HabitCompletion.create(req.params.habitId, req.params.id);
      res.json({ completed: true, habit });
    }
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    res.status(500).json({ error: 'Failed to toggle habit completion' });
  }
});

module.exports = router;
