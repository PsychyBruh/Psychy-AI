const express = require('express');
const auth    = require('../middleware/auth');
const { runLlama } = require('../utils/llama');
const { chatCompletion } = require('../utils/openai');
const { db } = require('../models/user');
const router = express.Router();

let guestCounts = {};  // ip → count

router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const { messages, isGuest } = req.body;

  // Guest limit
  if (isGuest) {
    const ip = req.ip;
    guestCounts[ip] = (guestCounts[ip] || 0) + 1;
    if (guestCounts[ip] > 20) return res.status(403).json({ error:'Register to continue' });
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  let llamaOutput = '', fallback = false;

  // Prepend a simple, natural system prompt
  const systemPrompt = {
    role: "system",
    content: "You are a helpful assistant."
  };
  const lastUser = messages.filter(m => m.role === "user").slice(-1)[0];
  const chatMessages = [systemPrompt, lastUser];

  // 1) run local LLM
  await runLlama(
    chatMessages,
    chunk => {
      // Only stream until the first stop sequence or double newline
      if (chunk.includes('\nuser:') || chunk.includes('user:') || chunk.includes('User:')) return;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    },
    { stream: true }
  ).then(r => {
    llamaOutput = r.text;
    // For testing: always skip OpenAI fallback
    // fallback = true;
  }).catch((err) => {
    console.error('runLlama error:', err);
    fallback = true;
  });

  // 2) fallback to OpenAI (disabled for testing)
  // if (fallback) {
  //   const aiRes = await chatCompletion(messages);
  //   res.write(`data: ${JSON.stringify({ chunk: aiRes })}\n\n`);
  //   llamaOutput = aiRes;
  // }

  // 3) Save history
  db.prepare(`
    INSERT INTO history (id,userId,prompt,response)
    VALUES (?,?,?,?)
  `).run(
    require('uuid').v4(),
    userId,
    messages.map(m=>m.content).join('\n'),
    llamaOutput
  );
  
  res.write('data: [DONE]\n\n');
  res.end();
});

module.exports = router;
