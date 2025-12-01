const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class JournalEntry {
  static create(userId, content, aiSummary = null, aiEmotion = null, aiAffirmation = null) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO journal_entries (id, user_id, content, ai_summary, ai_emotion, ai_affirmation) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, content, aiSummary, aiEmotion, aiAffirmation);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM journal_entries WHERE id = ?');
    return stmt.get(id);
  }

  static findByUserId(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM journal_entries 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset);
  }

  static update(id, content, aiSummary, aiEmotion, aiAffirmation) {
    const stmt = db.prepare(`
      UPDATE journal_entries 
      SET content = ?, ai_summary = ?, ai_emotion = ?, ai_affirmation = ?
      WHERE id = ?
    `);
    stmt.run(content, aiSummary, aiEmotion, aiAffirmation, id);
    return this.findById(id);
  }

  static updateAIReflection(id, aiSummary, aiEmotion, aiAffirmation) {
    const stmt = db.prepare(`
      UPDATE journal_entries 
      SET ai_summary = ?, ai_emotion = ?, ai_affirmation = ?
      WHERE id = ?
    `);
    stmt.run(aiSummary, aiEmotion, aiAffirmation, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM journal_entries WHERE id = ?');
    return stmt.run(id);
  }

  static getByDateRange(userId, startDate, endDate) {
    const stmt = db.prepare(`
      SELECT * FROM journal_entries 
      WHERE user_id = ? AND created_at >= ? AND created_at <= ?
      ORDER BY created_at DESC
    `);
    return stmt.all(userId, startDate, endDate);
  }

  static getCompletedHabits(entryId) {
    const stmt = db.prepare(`
      SELECT h.* FROM habits h
      INNER JOIN habit_completions hc ON h.id = hc.habit_id
      WHERE hc.journal_entry_id = ?
    `);
    return stmt.all(entryId);
  }
}

module.exports = JournalEntry;
