const User = require('../models/User');
const Habit = require('../models/Habit');
const { validate: uuidValidate } = require('uuid');

function requireString(value, errorMessage, res) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    res.status(400).json({ error: errorMessage });
    return null;
  }
  return value.trim();
}

async function getUserOr404(userId, res) {
  if (!uuidValidate(userId)) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return user;
}

async function getHabitOr404(habitId, res) {
  if (!uuidValidate(habitId)) {
    res.status(404).json({ error: 'Habit not found' });
    return null;
  }
  const habit = await Habit.findById(habitId);
  if (!habit) {
    res.status(404).json({ error: 'Habit not found' });
    return null;
  }
  return habit;
}

module.exports = {
  requireString,
  getUserOr404,
  getHabitOr404
};
