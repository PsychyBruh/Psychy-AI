const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { db }  = require('../models/user');
const config  = require('config');
const router  = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const id = uuid();
  try {
    db.prepare('INSERT INTO users (id,email,password) VALUES (?,?,?)')
      .run(id, email, hashed);
    res.sendStatus(201);
  } catch { res.status(400).json({ error: 'Email exists' }); }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!row || !(await bcrypt.compare(password, row.password)))
    return res.status(401).json({ error: 'Invalid creds' });
  const token = jwt.sign({ id: row.id, email }, config.get('jwtSecret'));
  res.json({ token });
});

module.exports = router;
