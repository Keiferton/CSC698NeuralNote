const User = require('../models/User');
const Habit = require('../models/Habit');

function requireString(value, errorMessage, res) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    res.status(400).json({ error: errorMessage });
    return null;
  }
  return value.trim();
}

function getUserOr404(userId, res) {
  const user = User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return user;
}

function getHabitOr404(habitId, res) {
  const habit = Habit.findById(habitId);
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
