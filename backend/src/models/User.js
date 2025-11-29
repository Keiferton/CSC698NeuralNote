const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class User {
  static create(username) {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO users (id, username) VALUES (?, ?)');
    stmt.run(id, username);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static findOrCreate(username) {
    let user = this.findByUsername(username);
    if (!user) {
      user = this.create(username);
    }
    return user;
  }
}

module.exports = User;
