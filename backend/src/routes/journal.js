const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const aiService = require('../services/aiService');
const { requireString, getUserOr404, getHabitOr404 } = require('./helpers');

// Get all journal entries for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await getUserOr404(req.params.userId, res);
    if (!user) return;

    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const entries = await JournalEntry.findByUserId(req.params.userId, limit, offset);
    
    // Add completed habits to each entry
    const entriesWithHabits = [];
    for (const entry of entries) {
      const completedHabits = await JournalEntry.getCompletedHabits(entry.id);
      entriesWithHabits.push({
        ...entry,
        completedHabits
      });
    }
    
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

    const user = await getUserOr404(userId, res);
    if (!user) return;

    // Get user's habits for detection
    const userHabits = await Habit.findByUserId(userId);
    
    // Generate AI reflection (now async)
    const reflection = await aiService.generateReflection(entryContent, userHabits);
    
    // Create the journal entry
    const entry = await JournalEntry.create(
      userId,
      entryContent,
      reflection.summary,
      reflection.emotion,
      reflection.affirmation
    );
    
    // Record habit completions
    const completedHabits = [];
    for (const habitId of reflection.detectedHabits) {
      const completion = await HabitCompletion.create(habitId, entry.id);
      if (completion) {
        const habit = await Habit.findById(habitId);
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
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const completedHabits = await JournalEntry.getCompletedHabits(entry.id);
    
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

    const existingEntry = await JournalEntry.findById(req.params.id);
    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Get user's habits for detection
    const userHabits = await Habit.findByUserId(existingEntry.user_id);
    
    // Regenerate AI reflection with updated content (now async)
    const reflection = await aiService.generateReflection(entryContent, userHabits);
    
    // Update the entry
    const entry = await JournalEntry.update(
      req.params.id,
      entryContent,
      reflection.summary,
      reflection.emotion,
      reflection.affirmation
    );
    
    // Update habit completions - remove old completions
    const oldCompletions = await HabitCompletion.findByJournalEntry(req.params.id);
    for (const completion of oldCompletions) {
      await HabitCompletion.delete(completion.id);
    }
    
    // Add new completions
    const completedHabits = [];
    for (const habitId of reflection.detectedHabits) {
      const completion = await HabitCompletion.create(habitId, entry.id);
      if (completion) {
        const habit = await Habit.findById(habitId);
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
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    await JournalEntry.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// Toggle habit completion for an entry
router.post('/:id/habits/:habitId/toggle', async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const habit = await getHabitOr404(req.params.habitId, res);
    if (!habit) return;
    
    // Check if completion exists
    const existingCompletion = await HabitCompletion.findByHabitAndEntry(
      req.params.habitId,
      req.params.id
    );
    
    if (existingCompletion) {
      // Remove completion
      await HabitCompletion.delete(existingCompletion.id);
      res.json({ completed: false, habit });
    } else {
      // Add completion
      await HabitCompletion.create(req.params.habitId, req.params.id);
      res.json({ completed: true, habit });
    }
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    res.status(500).json({ error: 'Failed to toggle habit completion' });
  }
});

module.exports = router;
