require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createBot } = require('./bot');
const { telegramAuth } = require('./middleware/telegramAuth');

// Route imports
const authRoutes = require('./routes/auth');
const lessonsRoutes = require('./routes/lessons');
const speakingRoutes = require('./routes/speaking');
const writingRoutes = require('./routes/writing');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
}));

// ── Body parsing ────────────────────────────────────────
app.use(express.json());

// ── Telegram Bot (Webhook mode) ─────────────────────────
const bot = createBot(process.env.BOT_TOKEN, process.env.FRONTEND_URL);

// Mount webhook handler BEFORE other routes
// Telegraf's webhookCallback returns an Express middleware
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
app.use(WEBHOOK_PATH, bot.webhookCallback(WEBHOOK_PATH));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EngRocket API',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ── API Routes (protected by Telegram auth) ─────────────
app.use('/api/auth', telegramAuth, authRoutes);
app.use('/api/lessons', telegramAuth, lessonsRoutes);
app.use('/api/speaking', telegramAuth, speakingRoutes);
app.use('/api/writing', telegramAuth, writingRoutes);
app.use('/api/progress', telegramAuth, progressRoutes);

// ── Error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server & register webhook ─────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 EngRocket API running on port ${PORT}`);

  // Set webhook with Telegram
  if (process.env.WEBHOOK_URL) {
    const webhookUrl = `${process.env.WEBHOOK_URL}${WEBHOOK_PATH}`;
    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`✅ Webhook registered: ${webhookUrl}`);
    } catch (err) {
      console.error('❌ Failed to set webhook:', err.message);
    }
  } else {
    console.warn('⚠️  WEBHOOK_URL not set — bot webhook not registered');
  }
});

module.exports = app;
