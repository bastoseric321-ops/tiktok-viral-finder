const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'viral_finder.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT,
      author TEXT,
      description TEXT,
      niche TEXT,
      views INTEGER,
      likes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      niche TEXT,
      min_views INTEGER,
      email_notify TEXT,
      active INTEGER DEFAULT 1
    )
  `);
});

module.exports = db;
