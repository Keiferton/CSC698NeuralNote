const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireString } = require('./helpers');

// Get or create a user
router.post('/', async (req, res) => {
  try {
    const username = requireString(req.body.username, 'Username is required', res);
    if (!username) return;

    const user = await User.findOrCreate(username);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
