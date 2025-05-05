const express = require('express');
const auth    = require('../middleware/auth');
const { createImage } = require('../utils/openai');
const router  = express.Router();

router.post('/', auth, async (req, res) => {
  const { prompt } = req.body;
  // currently always fallback to OpenAI
  const url = await createImage(prompt);
  res.json({ url });
});

module.exports = router;
