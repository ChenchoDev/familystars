import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import routes from './routes/index.js';

const app = express();

// Middleware
// CORS must come before helmet and other middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://familystarss.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.use(express.json());

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
});

export default app;
