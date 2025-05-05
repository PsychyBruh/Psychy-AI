const express = require('express');
const axios   = require('axios');
const config  = require('config');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', auth, async (req, res) => {
  const q = req.query.q;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${config.get('serpApiKey')}`;
  const r = await axios.get(url);
  res.json({ results: r.data.organic_results.map(o=>({ title:o.title, link:o.link })) });
});

module.exports = router;
