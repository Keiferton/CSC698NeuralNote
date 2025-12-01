const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class HabitCompletion {
  static create(habitId, journalEntryId) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO habit_completions (id, habit_id, journal_entry_id) 
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(id, habitId, journalEntryId);
    if (result.changes > 0) {
      return this.findById(id);
    }
    // Return existing completion if already exists
    return this.findByHabitAndEntry(habitId, journalEntryId);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM habit_completions WHERE id = ?');
    return stmt.get(id);
  }

  static findByHabitAndEntry(habitId, journalEntryId) {
    const stmt = db.prepare(`
      SELECT * FROM habit_completions 
      WHERE habit_id = ? AND journal_entry_id = ?
    `);
    return stmt.get(habitId, journalEntryId);
  }

  static findByJournalEntry(journalEntryId) {
    const stmt = db.prepare(`
      SELECT hc.*, h.name as habit_name 
      FROM habit_completions hc
      INNER JOIN habits h ON h.id = hc.habit_id
      WHERE hc.journal_entry_id = ?
    `);
    return stmt.all(journalEntryId);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM habit_completions WHERE id = ?');
    return stmt.run(id);
  }

  static deleteByHabitAndEntry(habitId, journalEntryId) {
    const stmt = db.prepare(`
      DELETE FROM habit_completions 
      WHERE habit_id = ? AND journal_entry_id = ?
    `);
    return stmt.run(habitId, journalEntryId);
  }
}

module.exports = HabitCompletion;
