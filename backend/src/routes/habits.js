const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const User = require('../models/User');

// Get all habits for a user
router.get('/user/:userId', (req, res) => {
  try {
    const user = User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const habits = Habit.findByUserId(req.params.userId);
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create a new habit
router.post('/', (req, res) => {
  try {
    const { userId, name, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Habit name is required' });
    }
    
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const habit = Habit.create(userId, name.trim(), description?.trim() || null);
    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Get a specific habit
router.get('/:id', (req, res) => {
  try {
    const habit = Habit.findById(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    res.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Update a habit
router.put('/:id', (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Habit name is required' });
    }
    
    const existingHabit = Habit.findById(req.params.id);
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    const habit = Habit.update(req.params.id, name.trim(), description?.trim() || null);
    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete a habit
router.delete('/:id', (req, res) => {
  try {
    const habit = Habit.findById(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    Habit.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Get habit completions by date range
router.get('/user/:userId/completions', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const user = User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const completions = Habit.getCompletionsByDateRange(req.params.userId, startDate, endDate);
    res.json(completions);
  } catch (error) {
    console.error('Error fetching completions:', error);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
});

module.exports = router;
