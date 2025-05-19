// Entry point for the Psychy AI backend
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import accountRoutes from './routes/account';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Increase server timeout to 5 minutes for long AI responses
const SERVER_TIMEOUT_MS = 300000; // 5 minutes

// Set timeout for all responses
app.use((req, res, next) => {
  res.setTimeout(SERVER_TIMEOUT_MS, () => {
    console.error('Request timed out after', SERVER_TIMEOUT_MS, 'ms:', req.method, req.originalUrl);
    res.status(504).json({ error: 'Request timed out. Please try again.' });
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Mount API routes
app.use('/api/chat', chatRoutes);
app.use('/api/account', accountRoutes);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/psychy-ai';

console.log('DEBUG MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Psychy AI backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
