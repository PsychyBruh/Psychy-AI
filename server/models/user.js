const Database = require('better-sqlite3');
const db = new Database('emerald.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT
  )`).run();
db.prepare(`
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY, userId TEXT, prompt TEXT, response TEXT, ts DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
module.exports = { db };
