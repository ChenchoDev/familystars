import dotenv from 'dotenv';
import app from './app.js';
import pool from './db/index.js';

dotenv.config();

const PORT = process.env.PORT || 3003;

// Check database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ Database connected');
  }
});

app.listen(PORT, () => {
  console.log(`
🌟 FamilyStars API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Server running on port ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}

  Endpoints:
  - Health: GET /health
  - Auth: POST /auth/magic-link
  - API: https://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
