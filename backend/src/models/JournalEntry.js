const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class JournalEntry {
  static async create(userId, content, aiSummary = null, aiEmotion = null, aiAffirmation = null) {
    const id = uuidv4();
    const result = await db.query(
      `
      INSERT INTO journal_entries (id, user_id, content, ai_summary, ai_emotion, ai_affirmation) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [id, userId, content, aiSummary, aiEmotion, aiAffirmation]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM journal_entries WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `
      SELECT * FROM journal_entries 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async update(id, content, aiSummary, aiEmotion, aiAffirmation) {
    const result = await db.query(
      `
      UPDATE journal_entries 
      SET content = $1, ai_summary = $2, ai_emotion = $3, ai_affirmation = $4
      WHERE id = $5
      RETURNING *
      `,
      [content, aiSummary, aiEmotion, aiAffirmation, id]
    );
    return result.rows[0] || null;
  }

  static async updateAIReflection(id, aiSummary, aiEmotion, aiAffirmation) {
    const result = await db.query(
      `
      UPDATE journal_entries 
      SET ai_summary = $1, ai_emotion = $2, ai_affirmation = $3
      WHERE id = $4
      RETURNING *
      `,
      [aiSummary, aiEmotion, aiAffirmation, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    await db.query('DELETE FROM journal_entries WHERE id = $1', [id]);
  }

  static async getByDateRange(userId, startDate, endDate) {
    const result = await db.query(
      `
      SELECT * FROM journal_entries 
      WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
      ORDER BY created_at DESC
      `,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getCompletedHabits(entryId) {
    const result = await db.query(
      `
      SELECT h.* FROM habits h
      INNER JOIN habit_completions hc ON h.id = hc.habit_id
      WHERE hc.journal_entry_id = $1
      `,
      [entryId]
    );
    return result.rows;
  }
}

module.exports = JournalEntry;
