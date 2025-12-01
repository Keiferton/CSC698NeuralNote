const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class Habit {
  static create(userId, name, description = null) {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO habits (id, user_id, name, description) VALUES (?, ?, ?, ?)');
    stmt.run(id, userId, name, description);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM habits WHERE id = ?');
    return stmt.get(id);
  }

  static findByUserId(userId) {
    const stmt = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  }

  static update(id, name, description) {
    const stmt = db.prepare('UPDATE habits SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
    return stmt.run(id);
  }

  static getCompletionsByDateRange(userId, startDate, endDate) {
    const stmt = db.prepare(`
      SELECT h.id, h.name, COUNT(hc.id) as completion_count
      FROM habits h
      LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        AND hc.completed_at >= ? AND hc.completed_at <= ?
      WHERE h.user_id = ?
      GROUP BY h.id
    `);
    return stmt.all(startDate, endDate, userId);
  }
}

module.exports = Habit;
