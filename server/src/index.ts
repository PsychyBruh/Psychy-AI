// Entry point for the Psychy AI backend
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import accountRoutes from './routes/account';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Security: Set secure HTTP headers
app.use(helmet());

// Security: Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Security: Improved CORS config (allow only from env or localhost)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());

// Input validation middleware (basic, can be extended)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && req.body[key].length > 10000) {
        return res.status(400).json({ error: 'Input too long' });
      }
    }
  }
  next();
});

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

let server: import('http').Server;
mongoose.connect(MONGO_URI)
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Psychy AI backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (server) server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
  });
});
