const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class HabitCompletion {
  static async create(habitId, journalEntryId) {
    const id = uuidv4();
    const result = await db.query(
      `
      INSERT INTO habit_completions (id, habit_id, journal_entry_id) 
      VALUES ($1, $2, $3)
      ON CONFLICT (habit_id, journal_entry_id) DO NOTHING
      RETURNING *
      `,
      [id, habitId, journalEntryId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return this.findByHabitAndEntry(habitId, journalEntryId);
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM habit_completions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByHabitAndEntry(habitId, journalEntryId) {
    const result = await db.query(
      `
      SELECT * FROM habit_completions 
      WHERE habit_id = $1 AND journal_entry_id = $2
      `,
      [habitId, journalEntryId]
    );
    return result.rows[0] || null;
  }

  static async findByJournalEntry(journalEntryId) {
    const result = await db.query(
      `
      SELECT hc.*, h.name as habit_name 
      FROM habit_completions hc
      INNER JOIN habits h ON h.id = hc.habit_id
      WHERE hc.journal_entry_id = $1
      `,
      [journalEntryId]
    );
    return result.rows;
  }

  static async delete(id) {
    await db.query('DELETE FROM habit_completions WHERE id = $1', [id]);
  }

  static async deleteByHabitAndEntry(habitId, journalEntryId) {
    await db.query(
      `
      DELETE FROM habit_completions 
      WHERE habit_id = $1 AND journal_entry_id = $2
      `,
      [habitId, journalEntryId]
    );
  }
}

module.exports = HabitCompletion;
