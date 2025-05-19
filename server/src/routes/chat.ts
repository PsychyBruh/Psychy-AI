import express from 'express';
import { Request, Response } from 'express';
import ChatSession from '../models/ChatSession';
import axios from 'axios';
import { Readable } from 'stream';

const router = express.Router();

// POST /api/chat - Send a message and get AI response (streaming or batch)
router.post('/', async (req: Request, res: Response) => {
  const { message, model = 'phi3:mini' } = req.body;
  console.log('[POST /api/chat] Incoming request:', { message, model });
  try {
    // Always use batch mode (no streaming)
    const ollamaRes = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model,
        prompt: message,
        stream: false, // Streaming disabled
      },
      { responseType: 'json' }
    );
    console.log('[POST /api/chat] Ollama response:', ollamaRes.data);
    const data = ollamaRes.data as { response: string };
    res.json({ reply: data.response });
    return;
  } catch (err: any) {
    console.error('[POST /api/chat] Error:', err && err.stack ? err.stack : err);
    if (err.response && err.response.data) {
      // Try to read Ollama's error message
      let ollamaError = '';
      try {
        if (typeof err.response.data === 'object' && err.response.data.error) {
          ollamaError = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          ollamaError = err.response.data;
        } else {
          ollamaError = JSON.stringify(err.response.data);
        }
      } catch (parseErr) {
        console.error('[POST /api/chat] Error parsing Ollama error:', parseErr);
      }
      console.error('[POST /api/chat] Ollama error:', ollamaError);
      res.status(500).json({ error: ollamaError || err.message || 'Failed to connect to Ollama' });
      return;
    } else {
      res.status(500).json({ error: err.message || 'Failed to connect to Ollama' });
      return;
    }
  }
});

// Get all chat sessions for a user
router.get('/sessions', async (req, res) => {
  // TODO: Use real user/session auth
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const sessions = await ChatSession.find({ userId });
  res.json(sessions);
});

// Create a new chat session
router.post('/sessions', async (req, res) => {
  // TODO: Use real user/session auth
  const { userId, title } = req.body;
  if (!userId || !title) return res.status(400).json({ error: 'Missing userId or title' });
  const session = await ChatSession.create({ userId, title, archived: false, messages: [] });
  res.status(201).json(session);
});

// Update (rename/archive/unarchive) a chat session
router.patch('/sessions/:id', async (req, res) => {
  // TODO: Use real user/session auth
  const { id } = req.params;
  const { title, archived } = req.body;
  const session = await ChatSession.findByIdAndUpdate(id, { title, archived }, { new: true });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// Delete a chat session
router.delete('/sessions/:id', async (req, res) => {
  // TODO: Use real user/session auth
  const { id } = req.params;
  await ChatSession.findByIdAndDelete(id);
  res.json({ success: true });
});

// Add a message to a chat session
router.post('/sessions/:id/messages', async (req, res) => {
  // TODO: Use real user/session auth
  const { id } = req.params;
  const { sender, content } = req.body;
  if (!sender || !content) return res.status(400).json({ error: 'Missing sender or content' });
  const session = await ChatSession.findById(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.messages.push({ sender, content, timestamp: new Date() });
  await session.save();
  res.json(session);
});

export default router;
