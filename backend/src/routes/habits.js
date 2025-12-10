const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { requireString, getUserOr404, getHabitOr404 } = require('./helpers');

// Get all habits for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await getUserOr404(req.params.userId, res);
    if (!user) return;

    const habits = await Habit.findByUserId(req.params.userId);
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { userId, name, description } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const habitName = requireString(name, 'Habit name is required', res);
    if (!habitName) return;

    const user = await getUserOr404(userId, res);
    if (!user) return;

    const habit = await Habit.create(userId, habitName, description?.trim() || null);
    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Get a specific habit
router.get('/:id', async (req, res) => {
  try {
    const habit = await getHabitOr404(req.params.id, res);
    if (!habit) return;

    res.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Update a habit
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    const habitName = requireString(name, 'Habit name is required', res);
    if (!habitName) return;

    const existingHabit = await getHabitOr404(req.params.id, res);
    if (!existingHabit) return;

    const habit = await Habit.update(req.params.id, habitName, description?.trim() || null);
    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await getHabitOr404(req.params.id, res);
    if (!habit) return;

    await Habit.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Get habit completions by date range
router.get('/user/:userId/completions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const user = await getUserOr404(req.params.userId, res);
    if (!user) return;
    
    const completions = await Habit.getCompletionsByDateRange(req.params.userId, startDate, endDate);
    res.json(completions);
  } catch (error) {
    console.error('Error fetching completions:', error);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
});

module.exports = router;
