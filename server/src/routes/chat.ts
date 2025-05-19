import express from 'express';
import { Request, Response } from 'express';
import ChatSession from '../models/ChatSession';
import axios from 'axios';
import { Readable } from 'stream';

const router = express.Router();

// POST /api/chat - Send a message and get AI response (streaming or batch)
router.post('/', async (req: Request, res: Response) => {
  const { message, model = 'phi3:mini', stream = false } = req.body;
  console.log('[POST /api/chat] Incoming request:', { message, model, stream });
  if (stream) {
    // Streaming mode: proxy Ollama's SSE to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();
    try {
      const ollamaRes = await axios.post(
        'http://localhost:11434/api/generate',
        {
          model,
          prompt: message,
          stream: true,
        },
        { responseType: 'stream' }
      );
      const streamData = ollamaRes.data as NodeJS.ReadableStream;
      streamData.on('data', (chunk: Buffer) => {
        res.write(chunk);
      });
      streamData.on('end', () => {
        res.end();
      });
      streamData.on('error', (err: any) => {
        console.error('[POST /api/chat] Ollama stream error:', err);
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      });
      req.on('close', () => {
        if (typeof (streamData as any).destroy === 'function') {
          (streamData as any).destroy();
        }
      });
    } catch (err: any) {
      console.error('[POST /api/chat] Streaming error:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
    return;
  }
  try {
    const ollamaRes = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model,
        prompt: message,
        stream: false, // Always use non-streaming for compatibility
      },
      { responseType: 'json' }
    );
    console.log('[POST /api/chat] Ollama response:', ollamaRes.data);
    const data = ollamaRes.data as { response: string };
    res.json({ reply: data.response });
    return; // Ensure no further code runs
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
