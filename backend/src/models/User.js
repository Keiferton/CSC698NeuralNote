const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(username) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO users (id, username) VALUES ($1, $2) RETURNING *',
      [id, username]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUsername(username) {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async findOrCreate(username) {
    let user = await this.findByUsername(username);
    if (!user) {
      user = await this.create(username);
    }
    return user;
  }
}

module.exports = User;
