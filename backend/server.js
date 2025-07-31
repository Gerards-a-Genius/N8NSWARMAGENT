const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const messageRoutes = require('./routes/messages');
const voiceRoutes = require('./routes/voice');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'agent-swarm-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/voice', voiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Agent Swarm API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Only listen if not running in Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Agent Swarm backend running on port ${PORT}`);
  });
}

module.exports = app;