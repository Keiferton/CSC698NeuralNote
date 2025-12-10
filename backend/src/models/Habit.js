const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class Habit {
  static async create(userId, name, description = null) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO habits (id, user_id, name, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, name, description]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM habits WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, name, description) {
    const result = await db.query(
      'UPDATE habits SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    await db.query('DELETE FROM habits WHERE id = $1', [id]);
  }

  static async getCompletionsByDateRange(userId, startDate, endDate) {
    const result = await db.query(
      `
      SELECT h.id, h.name, COUNT(hc.id) as completion_count
      FROM habits h
      LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        AND hc.completed_at >= $1 AND hc.completed_at <= $2
      WHERE h.user_id = $3
      GROUP BY h.id
      `,
      [startDate, endDate, userId]
    );
    return result.rows;
  }
}

module.exports = Habit;
